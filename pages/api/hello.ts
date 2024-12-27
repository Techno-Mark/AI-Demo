import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

type Data = {
  success?: boolean;
  message?: string;
  data?: any;
};

let data: any;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === "POST") {
    try {
      const bodyData = req.body;

      return res.status(200).json({
        success: true,
        message: "This is Dev API for Internal Process Only"
      });


      // const externalApiUrl = "https://crm-stageapi.pacificabs.com:3015/api/lead/save"; 

      // const externalApiResponse = await axios.post(externalApiUrl, bodyData);

      // return res.status(200).json({
      //   success: true,
      //   message: externalApiResponse.data.Message,
      //   data: externalApiResponse.data.ResponseData,
      // });

      // data = bodyData;

      // let email = "";

      // data?.form_response.answers.forEach((answer: any) => {
      //   if (answer?.type == "email") {
      //     email = answer?.email;
      //   }
      // });

      // if (!email) {
      //   return res
      //     .status(400)
      //     .json({
      //       success: false,
      //       message: "email not found in submission form",
      //     });
      // }

      // const wixUSer = await axios.get(
      //   `${process.env.NEXT_PUBLIC_WIX_BASE_URL}/userByEmail?email=${email}`
      // );

      // if (!wixUSer || !wixUSer?.data?.exists) {
      //   return res
      //     .status(400)
      //     .json({ success: false, message: "email not found in wix data" });
      // }

      // const formData = new FormData()
      // formData.append('prompt', JSON.stringify(data))

      // const result = await axios.post(
      //   `${process.env.NEXT_PUBLIC_PRODUCT_RECOMMEND_BASE_URL}/process_products`,
      //   formData
      // );

      // const filePath = path.join(process.cwd(), "products.json");
      // const newProducts = result.data?.matched_products || [];
     
      // fs.writeFileSync(filePath, JSON.stringify(newProducts, null, 2));

      // res
      //   .status(200)
      //   .json({
      //     success: true,
      //     message: "Product recommnedation retrieved successfully",
      //     data: result.data?.matched_products,
      //   });
    } catch (error: any) {
      console.log(error)
      return res.status(500).json({ success: false, message: error.message });
    }
  } else {
    res
      .status(200)
      .json({ message: "Ok", data: data ? data : "No data received yet" });
  }
}