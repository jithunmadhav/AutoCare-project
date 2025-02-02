import crypto from 'crypto'
import stripe from 'stripe';
import { randomNumber } from '../helper/randomNum.js';
import appiontmentModel from "../model/appointmentModel.js"
import { createInvoice } from '../helper/invoice/pdfkit.js';
import userModel from '../model/userModel.js';
import { sendInvoice } from '../helper/mail.js';
import mechanicModel from '../model/mechanicModel.js';
import Razorpay from 'razorpay';
import cancelbookingModel from '../model/bookingCancelModel.js';

const instance = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.KEY_SECRET,
});

export const emergencySchedule=async(req,res)=>{
    try {
      if(req.body.mechanic.booking=='Scheduled booking'){
        const currDate=new Date( new Date(req.body.mechanic.selectedDate).toISOString().split('T')[0])
        console.log(currDate);
        await appiontmentModel.create({
          mechanic_id:req.body.mechanic._id,
          selectedService:req.body.mechanic.selectedService,
          coordinates:req.body.mechanic.coordinates,
          booking_type:req.body.mechanic.booking,
          selectedVehicle_id:req.body.selectedVehicle,
          userLocation:req.body.location,
          complaint:req.body.complaint,
          selectedDate:currDate,
          selectedTime:req.body.mechanic.selectedTime,
          userId:req.body.userId,
          username:req.body.username
      }).then((result)=>{
          res.status(200).json({err:false})
      }).catch(err=>console.log(err))
      }else{
        await appiontmentModel.create({
            mechanic_id:req.body.mechanic._id,
            mechanic_name:req.body.mechanic.name,
            mechanic_mobile:req.body.mechanic.mobile,
            selectedService:req.body.mechanic.selectedService,
            coordinates:req.body.mechanic.coordinates,
            booking_type:req.body.mechanic.booking,
            selectedVehicle_id:req.body.selectedVehicle,
            userLocation:req.body.location,
            complaint:req.body.complaint,
            userId:req.body.userId
            , username:req.body.username

            
        }).then((result)=>{
            res.status(200).json({err:false})
        }).catch(err=>console.log(err))
      }
    } catch (error) {
        res.status(500).json({err:true,message:'internal server error'})
        console.log(error);
    }

}

const stripePayment = async (req, res) => {
  const minAmount = req.body.minAmount;
  const stripeInstance = stripe(process.env.STRIPE_SECRET_KEY);
  console.log(req.body.mechanic.selectedDate);
  const currDate=new Date( new Date(req.body.mechanic.selectedDate).toISOString().split('T')[0])
  console.log(currDate);

  try {
    const customer = await stripeInstance.customers.create({
      metadata: {
        mechanic_id: req.body.mechanic._id,
        mechanic_name:req.body.mechanic.name,
        amount:req.body.mechanic.minAmount,
        mechanic_mobile:req.body.mechanic.mobile,
        minAmount:req.body.mechanic.minAmount,
        selectedService: req.body.mechanic.selectedService,
        booking_type: req.body.mechanic.booking,
        selectedVehicle_id: req.body.selectedVehicle,
        userLocation: req.body.location,
        complaint: req.body.complaint,
        selectedDate: currDate,
        selectedTime: req.body.mechanic.selectedTime,
        userId: req.body.userId,
        username:req.body.username

      },
    });

    const session = await stripeInstance.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: req.body.mechanic.booking,
            },
            unit_amount: minAmount * 100,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'https://autoaid.netlify.app/success',
      cancel_url: 'http://localhost:3000/*',
      billing_address_collection: 'auto',
      customer: customer.id,
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
};

export default stripePayment;


const webhookHandler = async (req, res) => {
  const stripeInstance = stripe(process.env.STRIPE_SECRET_KEY);
  const webhookSecret = 'whsec_tJpTV0RQdScNHCdFZBAjfvRus43pKIjF'; // Replace with your webhook signing secret
  const payload = req.body;
  const payloadString = JSON.stringify(payload, null, 2);
  const header = stripe.webhooks.generateTestHeaderString({
    payload: payloadString,
    secret: webhookSecret,
  });

  try {
    let event = stripe.webhooks.constructEvent(payloadString, header, webhookSecret);
    console.log(event);
    
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        const customerId = session.customer;
 
        const customer = await stripeInstance.customers.retrieve(customerId);
    

        const appointmentData = {
          mechanic_id: customer.metadata.mechanic_id,
          mechanic_name:customer.metadata.mechanic_name,
          amount:customer.metadata.amount,
          mechanic_mobile:customer.metadata.mechanic_mobile,
          selectedService: customer.metadata.selectedService,
          booking_type: customer.metadata.booking_type,
          selectedVehicle_id: customer.metadata.selectedVehicle_id,
          userLocation: customer.metadata.userLocation,
          complaint: customer.metadata.complaint,
          selectedDate: new Date(customer.metadata.selectedDate * 1000),
          selectedTime: customer.metadata.selectedTime,
          userId: customer.metadata.userId,
          username: customer.metadata.username,
        };
        // console.log(customer.metadata.mechanic_id,customer.metadata.selectedDate);
        await appiontmentModel.create(appointmentData)
        const timestamp = customer.metadata.selectedDate * 1000; // Multiply by 1000 to convert from seconds to milliseconds
        const date = new Date(timestamp);
        const existingDate = await mechanicModel.findOne({ 
          _id: customer.metadata.mechanic_id, 
          booked: { $elemMatch: { currDate: date.toLocaleDateString() } } 
        });
        if (existingDate) {
          const result = existingDate.booked.find(e => e.currDate === date.toLocaleDateString());
          const newTimeArray={value:customer.metadata.selectedTime}
          const selectedtime = [...result.selectedTime, newTimeArray];
        
          await mechanicModel
            .updateOne(
              { _id: customer.metadata.mechanic_id, 'booked.currDate':date.toLocaleDateString() },
              { $set: { 'booked.$.selectedTime': selectedtime } ,$inc: { wallet: parseInt(customer.metadata.minAmount) }}
            )
          }else{
            await mechanicModel.updateOne(
              { _id: customer.metadata.mechanic_id },
              {
                $addToSet: {
                  booked: {
                    currDate: date.toLocaleDateString(),
                    date: date,
                    selectedTime: [{ value: customer.metadata.selectedTime }],
                  },
                },
                $inc: { wallet: parseInt(customer.metadata.minAmount) },
              }
            );
            
          }
        
        await userModel.findOne({_id:customer.metadata.userId}).then((result)=>{
         const num=randomNumber()
         const invoice={
           invoiceNumber: `INV-${num}`,
           date: new Date(),
           customerName: result.name,
           amount: customer.metadata.minAmount,
           id: `BA-${result._id}`,
           totalAmount: customer.metadata.minAmount,
         }
         createInvoice(invoice,`/helper/invoice/invoice${num}.pdf`)
         setTimeout(() => {
           sendInvoice(result.email,`invoice${num}.pdf`)
         }, 2000);
        
       })
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);  
    }

    res.json({ received: true });
  } catch (error) {
    console.error(`Error processing webhook: ${error.message}`);
    res.status(400).json({ error: 'Webhook error' });
  }
};


 export const generateRazorpay=(req,res)=>{
  const orderID=randomNumber()
  const options={
    amount: req.body.mechanic.minAmount*100,
    currency: "INR",
    receipt: orderID 
  };

 instance.orders.create(options,(err,order)=>{
  res.json({orderId:order})
 });
 }
 export const verifyPayment=async(req,res)=>{
        let hamc =crypto.createHmac('sha256', process.env.KEY_SECRET)
        hamc.update(req.body.payment.razorpay_order_id+'|'+req.body.payment.razorpay_payment_id)
        hamc=hamc.digest('hex')
        if(hamc==req.body.payment.razorpay_signature){
          const currDate=new Date( new Date(req.body.mechanic.selectedDate).toISOString().split('T')[0])
          await appiontmentModel.create({
            mechanic_id:req.body.mechanic._id,
            mechanic_name:req.body.mechanic.name,
            amount:parseInt(req.body.mechanic.minAmount),
            mechanic_mobile:req.body.mechanic.mobile,
            selectedService:req.body.mechanic.selectedService,
            coordinates:req.body.mechanic.coordinates,
            booking_type:req.body.mechanic.booking,
            selectedVehicle_id:req.body.selectedVehicle,
            userLocation:req.body.location,
            complaint:req.body.complaint,
            selectedDate:currDate,
            selectedTime:req.body.mechanic.selectedTime,
            userId:req.body.userId,
            username:req.body.username

        })
        const timestamp = new Date( new Date(req.body.mechanic.selectedDate).toISOString().split('T')[0]).toLocaleDateString()
        const date = new Date(req.body.mechanic.selectedDate);
        const existingDate = await mechanicModel.findOne({ 
          _id: req.body.mechanic._id, 
          booked: { $elemMatch: { currDate: timestamp } } 
        });
          if (existingDate) {
          const result = existingDate.booked.find(e => e.currDate === timestamp);
          const newTimeArray={value:req.body.mechanic.selectedTime}
          const selectedtime = [...result.selectedTime, newTimeArray];
        
          await mechanicModel
            .updateOne(
              { _id:  req.body.mechanic._id, 'booked.currDate':timestamp},
              { $set: { 'booked.$.selectedTime': selectedtime } ,$inc:{'wallet':parseInt(req.body.mechanic.minAmount)} }
            )
          }else{
            await mechanicModel
            .updateOne(
              { _id: req.body.mechanic._id },
              {
                $addToSet: {
                  booked: {
                    currDate:timestamp,
                    date: date,
                    selectedTime: [{value:req.body.mechanic.selectedTime}],                    
                  },
                },$inc:{'wallet':parseInt(req.body.mechanic.minAmount)}
              }
            )
          }
        await userModel.findOne({_id:req.body.userId}).then((result)=>{
          const num=randomNumber()
          const invoice={
            invoiceNumber: `INV-${num}`,
            date: new Date(),
            customerName: result.name,
            amount: req.body.mechanic.minAmount,
            id: req.body.payment.razorpay_payment_id,
            totalAmount: req.body.mechanic.minAmount,
          }
          createInvoice(invoice,`/helper/invoice/invoice${num}.pdf`)
         setTimeout(() => {
           sendInvoice(result.email,`invoice${num}.pdf`)
         }, 2000);
         res.status(200).json({err:false})
        }).catch(err=>console.log(err))      
      }else{
          res.json({err:true})
        }
 }
 export const getscheduledApp = async (req, res) => {
  try {
    const { search, page } = req.query;
    const perPage = 4;
    const currentPage = parseInt(page) || 1;
    const id = req.query.id;
    const query = {
      mechanic_id: id,
      booking_type: 'Scheduled booking',
      username: new RegExp(search, 'i')
    };
    const totalAppointments = await appiontmentModel.countDocuments(query);
    const totalPages = Math.ceil(totalAppointments / perPage);
    const result = await appiontmentModel
      .find({ ...query })
      .skip((currentPage - 1) * perPage)
      .limit(perPage)
      .lean();
    if (result) {
      res.status(200).json({ err: false, result, totalPages });
    } else {
      res.status(404).json({ err: true });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ err: true, error });
  }
};

export const getEmergencyApp = async (req, res) => {
  try {
    const { search, page } = req.query;
    const perPage = 4;
    const currentPage = parseInt(page) || 1;
    const id = req.query.id;
    const query = {
      mechanic_id: id,
      booking_type: 'Emergency booking',
      username: new RegExp(search, 'i')
    };
    const totalAppointments = await appiontmentModel.countDocuments(query);
    const totalPages = Math.ceil(totalAppointments / perPage);
    const result = await appiontmentModel
      .find({ ...query })
      .skip((currentPage - 1) * perPage)
      .limit(perPage)
      .lean();
    if (result) {
      res.status(200).json({ err: false, result, totalPages });
    } else {
      res.status(404).json({ err: true });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ err: true, error });
  }
};

 

 export const customerDetails=async(req,res)=>{
  await userModel.findOne({_id:req.params.id}).then((result)=>{
    res.status(200).json({err:false,result})
  }).catch((error)=>{
    res.status(404).json({err:true,error})
  })
 }

 export const updateStatus = async (req, res) => {
  try {
    const { id, status } = req.body;
    await appiontmentModel.updateOne({ _id: id }, { $set: { status } });
    res.status(200).json({ err: false });
  } catch (error) {
    res.status(500).json({ err: true, error });
  }
};


export const completedBookingHistory = async (req, res) => {
  try {
    const { search, page } = req.query;
    const perPage = 4;
    const currentPage = parseInt(page) || 1;
    const id = req.query.id;
    const query = {
      userId: id,
      status:'completed',
      username: new RegExp(search, 'i')
    };
    const totalAppointments = await appiontmentModel.countDocuments(query);
    const totalPages = Math.ceil(totalAppointments / perPage);
    const result = await appiontmentModel
      .find({ ...query })
      .skip((currentPage - 1) * perPage)
      .limit(perPage)
      .lean();
    if (result) {
      res.status(200).json({ err: false, result, totalPages });
    } else {
      res.status(404).json({ err: true });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ err: true, error });
  }
};

export const newBooking = async (req, res) => {
  try {
    const { search, page } = req.query;
    const perPage = 4;
    const currentPage = parseInt(page) || 1;
    const id = req.query.id;
    const query = {
      userId: id,
      status: { $ne: 'completed' },
      username: new RegExp(search, 'i')
    };
    const totalAppointments = await appiontmentModel.countDocuments(query);
    const totalPages = Math.ceil(totalAppointments / perPage);
    const result = await appiontmentModel
      .find({ ...query })
      .skip((currentPage - 1) * perPage)
      .limit(perPage)
      .lean();
    if (result) {
      res.status(200).json({ err: false, result, totalPages });
    } else {
      res.status(404).json({ err: true });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ err: true, error });
  }
};

export const cancelBooking=async(req,res)=>{
try {
  const {reason,paymentId,paymentAmount,mechanic_id,userId,appointment_id}=req.body
 await cancelbookingModel.create({reason,paymentId,paymentAmount,mechanic_id,userId,appointment_id})
 await appiontmentModel.updateOne({_id:appointment_id},{$set:{cancelStatus:'requested'}})
 res.status(200).json({err:false})

} catch (error) {
  res.status(500).json({err:true,error})
}
}

export const cancelRequest=async(req,res)=>{
try {
  const appointment_id=req.query.appointment_id
  const result=await cancelbookingModel.findOne({appointment_id:appointment_id})
  res.status(200).json({err:false,result})
} catch (error) {
  res.status(500).json({err:true,error})
}
}

export const cancelBookingMechanic=async(req,res)=>{
try {
  const {paymentId,paymentAmount,mechanic_id,appointment_id,status}=req.body;
  if(status=='reject'){
    await appiontmentModel.updateOne({_id:appointment_id},{$set:{cancelStatus:'rejected'}})
    res.status(200).json({err:false})
  }else{
    const refund = await instance.payments.refund(paymentId, {
      amount: paymentAmount,
    });
    console.log(refund);
    if(refund.status=='processed'){
     const appointment= await appiontmentModel.findOne({_id:appointment_id})
     const selectedDate=new Date(appointment.selectedDate).toLocaleDateString()
     const selectedTime=appointment.selectedTime
     const timeslot = await mechanicModel.findOne({
      _id: mechanic_id},{booked:1});
      const currDate=timeslot.booked.find(e=>e.currDate==selectedDate)
      const updatedSelectedTime = currDate.selectedTime.filter((time) => time.value !== selectedTime);
      await mechanicModel .updateOne(
        { _id:mechanic_id, 'booked.currDate':selectedDate},
        { $set: { 'booked.$.selectedTime': updatedSelectedTime } ,$inc:{'wallet':-parseInt(paymentAmount)} }
      )  
      await appiontmentModel.updateOne({_id:appointment_id},{$set:{cancelStatus:'cancelled',status:'cancelled'}})
      res.status(200).json({err:false})
    }else{
      res.status(404).json({err:true})
    }
  }
} catch (error) {
  res.status(500).json({err:true,error,message:'something went wrong'})
}
}





export { stripePayment, webhookHandler };

