import  express  from 'express';
import { addVehicle, allVehicle, deleteVehicle } from '../controller/serviceController.js';
import { forgotPassword, resendOtp, resetpassword, userLogin, userLogout, userSignup, VerifyResetOtp, verifyUserSignup } from '../controller/userController.js';
import { userCheckAuth } from '../middleware/userAuth.js';
const router=express.Router()

router.get('/auth',userCheckAuth)
router.post('/signup',userSignup).post('/verifySignup',verifyUserSignup).post('/resendOtp',resendOtp)
router.post('/forgotPassword',forgotPassword).post('/resetPassword',resetpassword).post('/verifyResetOtp',VerifyResetOtp)
router.post('/addvehicle',addVehicle).get('/allvehicle/:id',allVehicle).delete('/deletevehicle',deleteVehicle)
router.post('/login',userLogin).get('/logout',userLogout)


export default router