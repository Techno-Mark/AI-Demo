import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  name?: string;
  message?: string;
  data?: any;
};

let data: any;

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method === 'POST') {
    const bodyData = req.body; 
    data = bodyData;           
    return res.redirect('/product-recommendation');
    res.status(200).json({ message: 'Ok' });
  } else {
    res.status(200).json({ message: 'Ok', data: data ? (data) : 'No data received yet' });
  }
}
