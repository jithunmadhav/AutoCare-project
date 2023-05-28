import React from 'react';
import './Home.css';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { CardActionArea } from '@mui/material';

function Home() {
  // Define an array of data for the cards
  const cardData = [
    {
      title: 'Card 1',
      image: 'https://img.freepik.com/premium-photo/mechanic-works-engine-car-garage-repair-service-concept-car-inspection-service-car-repair-service_545582-3.jpg?w=1380',
    },
    {
      title: 'Card 2',
      image: 'https://img.freepik.com/premium-photo/mechanic-works-engine-car-garage-repair-service-concept-car-inspection-service-car-repair-service_545582-3.jpg?w=1380',
    },
    {
      title: 'Card 3',
      image: 'https://img.freepik.com/premium-photo/mechanic-works-engine-car-garage-repair-service-concept-car-inspection-service-car-repair-service_545582-3.jpg?w=1380',
    },
    {
      title: 'Card 4',
      image: 'https://img.freepik.com/premium-photo/mechanic-works-engine-car-garage-repair-service-concept-car-inspection-service-car-repair-service_545582-3.jpg?w=1380',
    },
  ];

  return (
    <>
      <div className='background'>
        <div style={{ width: '50%' }}>
          <img className='background-img' src="https://autoaid.in/auto-aid-logo.png" alt="logo" />
          <h1>
            <span className="animated-text">Drive with confidence, your virtual garage is just a tap away</span>
          </h1>
        </div>
        <div style={{ width: '50%' }}>
          <h1 className='home-quotes'>&emsp;Any Time <br/> &nbsp; &nbsp;Any Where <br/> Aid For Vehicle</h1>
        </div>
      </div>
      <div className='secondPage'>
        <h1 className='services'>Our Services</h1>
        <div className='cards'>
        {cardData.map((card, index) => (
          <Card key={index} sx={{ maxWidth: 345 }} style={{ borderRadius:'15px' }}>
            <CardActionArea>
              <CardMedia
                component="img"
                height="140"
                style={{ height:'240px' }}
                image={card.image}
                alt={card.title}
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  {card.title}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
        </div>
      </div>
      <div className='Third-page'>
        <h2 className='whyAutoAid'> Why AutoAid ?</h2>
        <p className='whyAutoAid' style={{ fontSize:'20px' }}> Auto Aid, as the name suggests, acts as a helping hand for Automobile users. 
          It is an app to help users connect to Automotive Service Providing firms and skilled mechanics.</p>
          <p className='whyAutoAid' style={{ fontSize:'20px' }}>Using Auto Aid, users can search for the best and reasonable, timely service provider at their desired locations.
             They need to choose their nearby area from the Active Service <br/> Providers List.</p>
          <p className='whyAutoAid' style={{ fontSize:'20px' }}>In short, the user can carry a garage on his phone. 
              Helping our users to enjoy a hassle-free voyage across Kerala is the primary intention behind the development of Auto Aid.</p>
      </div>
    </>
  );
}

export default Home;