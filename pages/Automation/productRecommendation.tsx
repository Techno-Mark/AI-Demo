import axios from "axios";
import React, { useState } from "react";
import { ToastContainer, ToastOptions, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";
import loader from "../../public/loder.gif";

const toastOptions: ToastOptions = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "light",
};

const ProductRecommendation = () => {
  const [prompt, setPrompt] = useState("");
  const [disabled, setDisabled] = useState(false);
  const [response, setResponse] = useState([]);

  const handleUpload = async (e:any) => {
    e.preventDefault();
    setDisabled(true);
    const body = { prompt };
    try {
      const result = await axios.get(
        `${process.env.NEXT_PUBLIC_PRODUCT_RECOMMEND_BASE_URL}`
      );

      if (result.status === 200) {
        toast.success("Products retrieved successfully", toastOptions);
        setResponse(result.data?.items?.splice(0,9) || []); 
      } else {
        toast.error(result.data.message, toastOptions);
      }
    } catch (error:any) {
      toast.error(error?.message, toastOptions);
    } finally {
      setPrompt('');
      setDisabled(false);
    }
  };

  return (
    <>
      {disabled ? (
        <div className="flex justify-center items-center min-h-[calc(100vh-70px)] bg-[#fcfcff]">
          <Image src={loader} alt="Loader" />
        </div>
      ) : (
        <section className="automationSection px-5 py-9">
          <div className="container mx-auto px-20">
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
              <ToastContainer
                position="top-center"
                autoClose={5000}
                hideProgressBar={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
              />
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr className="text-center">
                    <th scope="col" className="px-6 py-3 text-start">
                      Product Recommendation
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white border-b text-center">
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap text-start">
                      <textarea
                        className="w-full f-16 py-2 px-4 rounded-lg text-sm text-gray-900 border border-gray-300 bg-gray-50 focus:outline-none dark:bg-gray-700 dark:border-gray-600"
                        placeholder="Type your prompt here..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                      />
                    </td>
                    <td className="flex px-6 py-4 gap-[15px] justify-center">
                      <button
                        className={`flex gap-[15px] bg-[#1492c8] text-white text-sm font-semibold px-4 py-2 rounded-md ${
                          disabled || !prompt
                            ? "cursor-not-allowed opacity-50"
                            : ""
                        }`}
                        onClick={disabled || !prompt ? undefined : handleUpload}
                      >
                        Search
                      </button>
                    </td>
                  </tr>
                  {response && response.length > 0 && (
                    <tr>
                      <td colSpan={2} className="bg-white py-3 px-5">
                      <p className="text-2xl font-semibold text-gray-700 mb-3">
                        <strong>Result:</strong>
                      </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-7 bg-gray-100 border border-gray-200 rounded-lg px-4 py-6">
                          {response.map((product:any, index) => (
                            <ProductCard
                              key={product._id} 
                              title={product.name} 
                              description={product.description}
                              mediaId={product.mediaItems[0]?.id}
                              price={product.price}
                            />
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </>
  );
};

interface ProductCardProps {
  title: string;
  description: string;
  price: number;
  mediaId:string
}

const ProductCard: React.FC<ProductCardProps> = ({ title, description, price,mediaId }) => {
  // let imageURL = `https://static.wixstatic.com/media/${mediaId}/v1/fit/w_500,h_500,q_90/file.png`;
    let imageURL = `https://static.wixstatic.com/media/${mediaId}`;
  return (
    <div className="max-w-xs rounded-lg shadow-lg bg-white transition-transform transform hover:scale-105">
      <img className="w-full h-48 object-contain" src={imageURL} alt={title} />
      <div className="px-6 py-4">
        <div className="font-bold text-xl mb-2">{title}</div>
        <p className="text-gray-700 text-base">{description}</p>
      </div>
      <div className="px-6 py-4">
        <span className="text-gray-900 font-bold text-lg">{`₹${price.toFixed(2)}`}</span>
      </div>
    </div>
  );
};

export default ProductRecommendation;