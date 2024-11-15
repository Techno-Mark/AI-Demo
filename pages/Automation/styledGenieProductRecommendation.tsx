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

const styleChoices = [
  "Casuals",
  "Business Casuals",
  "Smart Casuals",
  "Trendy / Fashion-Forward",
  "Classic/Timeless",
  "Edgy/Bold",
  "Sporty/Athleisure",
  "Bohemian",
  "Minimalist/Simple",
];
const clothingChoices = [
  "Tailored suits and structured pieces",
  "Relaxed and flowy outfits",
  "Comfortable and functional",
  "Chic and polished looks",
  "Trend-driven, experimental styles",
];
const colorChoices = ["Warm", "Cool", "Neutral", "Spring", "Light"];

const initialData = {
  email: "",
  gender: "",
  bodyType: "",
  ageGroup: "",
  height: "",
  styles: [],
  confidentInClothing: [],
  colorPalettes: [],
  favoriteBrand: "",
  fabricAllergies: "",
  adventurousStyle: "",
  clothingNeeds: [],
  typicalDay: [],
  priorities: [],
  topSize: "",
  clothingSizeBottoms: "",
  additionalInfo: "",
  budget: "",
  shoeSize: "",
};

const StyledGenieProductRecommendation = () => {
  const [mode, setMode] = useState("StyledGenie");
  const [data, setData] = useState<typeof initialData>(initialData);
  const [disabled, setDisabled] = useState(false);
  const [response, setResponse] = useState([]);

  const handleUpload = async (e: any) => {
    e.preventDefault();
    setDisabled(true);

    try {
      let queryString = Object.keys(data)
        .filter((key) => key !== "email")
        .map((key: any) => {
          const value = data[key as keyof typeof initialData];
          if (Array.isArray(value)) {
            return value.join(" ");
          }
          return value;
        })
        .join(" ");

      queryString = queryString?.trim()
      console.log("query", queryString);

      let result = null

      if(mode === "StyledGenie"){
        console.log('StyledGenie')
        result = await axios.post(
          `${process.env.NEXT_PUBLIC_STYLEDGENIE_PRODUCT_RECOMMEND_BASE_URL}/process_products`,
          { prompt: queryString }
        );
        console.log(result.data, "result data");
      }else{
        console.log('Developer')
        result = await axios.post(
          `${process.env.NEXT_PUBLIC_PRODUCT_RECOMMEND_BASE_URL}/process_products`,
          { prompt: queryString }
        );
        console.log(result.data, "result data");
      }

      if (result.status === 200) {
        toast.success("Products retrieved successfully", toastOptions);
        setResponse(result?.data?.matched_products || []);
      } else {
        setResponse([])
        toast.error(result?.data?.message, toastOptions);
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || error?.response?.data?.error || error?.message,
        toastOptions
      );
      setResponse([])
    } finally {
      setDisabled(false);
    }
  };

  const handleChange = (id: string, value: any) => {
    setData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleMultiSelectChange = (
    id: string,
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const options = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setData((prevData) => ({
      ...prevData,
      [id]: options,
    }));
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
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr className="text-center">
                    <th scope="col" className="px-6 py-3 text-start">
                      StyledGenie Product Recommendation
                    </th>
                    {/* <th scope="col" className="px-6 py-3">
                      Action
                    </th> */}
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 text-center">
                    <td
                      colSpan={2}
                      className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white text-start flex flex-col gap-2"
                    >
                      <div className="mb-4">
                        <label
                          htmlFor="mode"
                          className="block text-lg font-medium text-gray-700"
                        >
                          Testing Mode
                        </label>
                        <select
                          id="mode"
                          value={mode}
                          onChange={(e) => {
                            setMode(e.target.value)
                            setResponse([])
                          }}
                          className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="StyledGenie">StyledGenie</option>
                          <option value="Developer">Developer</option>
                        </select>
                      </div>

                      <div className="mb-4">
                        <label
                          htmlFor="email"
                          className="block text-lg font-medium text-gray-700"
                        >
                          Email
                        </label>
                        <input
                          id="email"
                          type="email"
                          value={data?.email}
                          onChange={(e) =>
                            handleChange("email", e.target.value)
                          }
                          className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter your email"
                          required
                        />
                      </div>

                      <div className="mb-4">
                        <label
                          htmlFor="gender"
                          className="block text-lg font-medium text-gray-700"
                        >
                          Your Gender
                        </label>
                        <select
                          id="gender"
                          value={data.gender}
                          onChange={(e) =>
                            handleChange("gender", e.target.value)
                          }
                          className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select your gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>

                      <div className="mb-4">
                        <label
                          htmlFor="bodyType"
                          className="block text-lg font-medium text-gray-700"
                        >
                          Body Type
                        </label>
                        <select
                          id="bodyType"
                          value={data.bodyType}
                          onChange={(e) =>
                            handleChange("bodyType", e.target.value)
                          }
                          className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select your body type</option>
                          <option value="Rectangle">Rectangle</option>
                          <option value="Inverted Triangle">
                            Inverted Triangle
                          </option>
                          <option value="Trapezoid">Trapezoid</option>
                          <option value="Triangle">Triangle</option>
                          <option value="Oval">Oval</option>
                          <option value="None">None</option>
                        </select>
                      </div>

                      <div className="mb-4">
                        <label
                          htmlFor="ageGroup"
                          className="block text-lg font-medium text-gray-700"
                        >
                          Age Group
                        </label>
                        <select
                          id="ageGroup"
                          value={data.ageGroup}
                          onChange={(e) =>
                            handleChange("ageGroup", e.target.value)
                          }
                          className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select your age group</option>
                          <option value="18-24">18-24</option>
                          <option value="25-34">25-34</option>
                          <option value="35-44">35-44</option>
                          <option value="45-54">45-54</option>
                          <option value="55+">55+</option>
                        </select>
                      </div>

                      <div className="mb-4">
                        <label
                          htmlFor="height"
                          className="block text-lg font-medium text-gray-700"
                        >
                          Height
                        </label>
                        <select
                          id="height"
                          value={data.height}
                          onChange={(e) =>
                            handleChange("height", e.target.value)
                          }
                          className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select your height</option>
                          <option value="Under 5'4 (160 cm)">
                            Under 5&apos;4 (160 cm)
                          </option>
                          <option value="5'4–5'7 (160–170 cm)">
                            5&apos;4–5&apos;7 (160–170 cm)
                          </option>
                          <option value="5'8–6'0 (173–183 cm)">
                            5&apos;8–6&apos;0 (173–183 cm)
                          </option>
                          <option value="Over 6'0 (183 cm)">
                            Over 6&apos;0 (183 cm)
                          </option>
                        </select>
                      </div>

                      <div className="mb-4">
                        <label className="block text-lg font-medium text-gray-700">
                          How would you describe your current style?
                        </label>
                        <select
                          multiple
                          value={data.styles}
                          onChange={(e) => handleMultiSelectChange("styles", e)}
                          className="mt-2 w-full p-2 border border-gray-300 rounded-md"
                        >
                          {styleChoices.map((choice, index) => (
                            <option key={index} value={choice}>
                              {choice}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="mb-4">
                        <label className="block text-lg font-medium text-gray-700">
                          What type of clothing do you feel most confident in?
                        </label>
                        <select
                          multiple
                          value={data.confidentInClothing}
                          onChange={(e) =>
                            handleMultiSelectChange("confidentInClothing", e)
                          }
                          className="mt-2 w-full p-2 border border-gray-300 rounded-md"
                        >
                          {clothingChoices.map((choice, index) => (
                            <option key={index} value={choice}>
                              {choice}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="mb-4">
                        <label className="block text-lg font-medium text-gray-700">
                          What are your preferred color palettes?
                        </label>
                        <select
                          multiple
                          value={data.colorPalettes}
                          onChange={(e) =>
                            handleMultiSelectChange("colorPalettes", e)
                          }
                          className="mt-2 w-full p-2 border border-gray-300 rounded-md"
                        >
                          {colorChoices.map((choice, index) => (
                            <option key={index} value={choice}>
                              {choice}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="mb-4">
                        <label
                          htmlFor="favoriteBrand"
                          className="block text-lg font-medium text-gray-700"
                        >
                          What are your favorite clothing brand or designer?
                        </label>
                        <input
                          type="text"
                          id="favoriteBrand"
                          value={data.favoriteBrand}
                          onChange={(e) =>
                            handleChange("favoriteBrand", e.target.value)
                          }
                          className="mt-2 w-full p-2 border border-gray-300 rounded-md"
                          placeholder="Enter your favorite brand or designer"
                        />
                      </div>

                      <div className="mb-4">
                        <label
                          htmlFor="fabricAllergies"
                          className="block text-lg font-medium text-gray-700"
                        >
                          Do you have any fabric allergies or sensitivities?
                        </label>
                        <input
                          type="text"
                          id="fabricAllergies"
                          value={data.fabricAllergies}
                          onChange={(e) =>
                            handleChange("fabricAllergies", e.target.value)
                          }
                          className="mt-2 w-full p-2 border border-gray-300 rounded-md"
                          placeholder="Enter your allergies or sensitivities"
                        />
                      </div>

                      <div className="mb-4">
                        <label
                          htmlFor="adventurousStyle"
                          className="block text-lg font-medium text-gray-700"
                        >
                          How adventurous are you when it comes to trying new
                          styles?
                        </label>
                        <select
                          id="adventurousStyle"
                          value={data.adventurousStyle}
                          onChange={(e) =>
                            handleChange("adventurousStyle", e.target.value)
                          }
                          className="mt-2 w-full p-2 border border-gray-300 rounded-md"
                        >
                          <option value="">Select an option</option>
                          <option value="Very adventurous">
                            Very adventurous
                          </option>
                          <option value="Somewhat open">Somewhat open</option>
                          <option value="Prefer sticking to my current style">
                            Prefer sticking to my current style
                          </option>
                        </select>
                      </div>

                      <div className="mb-4">
                        <label
                          htmlFor="clothingNeeds"
                          className="block text-lg font-medium text-gray-700"
                        >
                          What are your primary clothing needs right now?
                        </label>
                        <select
                          id="clothingNeeds"
                          multiple
                          value={data.clothingNeeds}
                          onChange={(e) =>
                            handleMultiSelectChange("clothingNeeds", e)
                          }
                          className="mt-2 w-full p-2 border border-gray-300 rounded-md"
                        >
                          <option value="Workwear">Workwear</option>
                          <option value="Weekend casual">Weekend casual</option>
                          <option value="Formal events">Formal events</option>
                          <option value="Vacation/Resort wear">
                            Vacation/Resort wear
                          </option>
                          <option value="Activewear">Activewear</option>
                          <option value="Special occasion">
                            Special occasion
                          </option>
                        </select>
                      </div>

                      <div className="mb-4">
                        <label
                          htmlFor="typicalDay"
                          className="block text-lg font-medium text-gray-700"
                        >
                          What is your typical day like?
                        </label>
                        <select
                          id="typicalDay"
                          multiple
                          value={data.typicalDay}
                          onChange={(e) =>
                            handleMultiSelectChange("typicalDay", e)
                          }
                          className="mt-2 w-full p-2 border border-gray-300 rounded-md"
                        >
                          <option value="Work in a corporate setting">
                            Work in a corporate setting
                          </option>
                          <option value="Casual office or remote work">
                            Casual office or remote work
                          </option>
                          <option value="On-the-go or active lifestyle">
                            On-the-go or active lifestyle
                          </option>
                          <option value="Primarily social outings or events">
                            Primarily social outings or events
                          </option>
                          <option value="Travel-heavy lifestyle">
                            Travel-heavy lifestyle
                          </option>
                        </select>
                      </div>

                      <div className="mb-4">
                        <label
                          htmlFor="priorities"
                          className="block text-lg font-medium text-gray-700"
                        >
                          What do you prioritize when selecting clothing?
                        </label>
                        <select
                          id="priorities"
                          multiple
                          value={data.priorities}
                          onChange={(e) =>
                            handleMultiSelectChange("priorities", e)
                          }
                          className="mt-2 w-full p-2 border border-gray-300 rounded-md"
                        >
                          <option value="Comfort">Comfort</option>
                          <option value="Fit">Fit</option>
                          <option value="Quality">Quality</option>
                          <option value="Trendiness">Trendiness</option>
                          <option value="Price">Price</option>
                        </select>
                      </div>

                      <div className="mb-4">
                        <label
                          htmlFor="topSize"
                          className="block text-lg font-medium text-gray-700"
                        >
                          What is your clothing size for tops?
                        </label>
                        <select
                          id="topSize"
                          value={data.topSize}
                          onChange={(e) =>
                            handleChange("topSize", e.target.value)
                          }
                          className="mt-2 w-full p-2 border border-gray-300 rounded-md"
                        >
                          <option value="XS">XS</option>
                          <option value="S">S</option>
                          <option value="M">M</option>
                          <option value="L">L</option>
                          <option value="XL">XL</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div className="mb-4">
                        <label
                          htmlFor="clothingSizeBottoms"
                          className="block text-lg font-medium text-gray-700"
                        >
                          What is your clothing size for bottoms?
                        </label>
                        <select
                          id="clothingSizeBottoms"
                          value={data.clothingSizeBottoms}
                          onChange={(e) =>
                            handleChange("clothingSizeBottoms", e.target.value)
                          }
                          className="mt-2 w-full p-2 border border-gray-300 rounded-md"
                        >
                          <option value="">Select your size</option>
                          <option value="EU 34">EU 34</option>
                          <option value="EU 36">EU 36</option>
                          <option value="EU 38">EU 38</option>
                          <option value="EU 40">EU 40</option>
                          <option value="EU 42">EU 42</option>
                          <option value="EU 44">EU 44</option>
                          <option value="EU 46">EU 46</option>
                        </select>
                      </div>

                      <div className="mb-4">
                        <label
                          htmlFor="shoeSize"
                          className="block text-lg font-medium text-gray-700"
                        >
                          What is your shoe size?
                        </label>
                        <select
                          id="shoeSize"
                          value={data.shoeSize}
                          onChange={(e) =>
                            handleChange("shoeSize", e.target.value)
                          }
                          className="mt-2 w-full p-2 border border-gray-300 rounded-md"
                        >
                          <option value="">Select your size</option>
                          <option value="EU 36">EU 36</option>
                          <option value="EU 37">EU 37</option>
                          <option value="EU 38">EU 38</option>
                          <option value="EU 39">EU 39</option>
                          <option value="EU 40">EU 40</option>
                          <option value="EU 41">EU 41</option>
                          <option value="EU 42">EU 42</option>
                        </select>
                      </div>

                      <div className="mb-4">
                        <label
                          htmlFor="budget"
                          className="block text-lg font-medium text-gray-700"
                        >
                          What’s your typical budget for clothing?
                        </label>
                        <select
                          id="budget"
                          value={data.budget}
                          onChange={(e) =>
                            handleChange("budget", e.target.value)
                          }
                          className="mt-2 w-full p-2 border border-gray-300 rounded-md"
                        >
                          <option value="">Select your budget</option>
                          <option value="Under €50 per item">
                            Under €50 per item
                          </option>
                          <option value="€50–€100 per item">
                            €50–€100 per item
                          </option>
                          <option value="€100–€200 per item">
                            €100–€200 per item
                          </option>
                          <option value="Over €200 per item">
                            Over €200 per item
                          </option>
                          <option value="€100 to €500">
                            budget between 100 to 500 €
                          </option>
                        </select>
                      </div>

                      <div className="mb-4">
                        <label
                          htmlFor="additionalInfo"
                          className="block text-lg font-medium text-gray-700"
                        >
                          Anything else you’d like us to know about your style,
                          preferences, or any special requests?
                        </label>
                        <input
                          type="text"
                          id="additionalInfo"
                          value={data.additionalInfo}
                          onChange={(e) =>
                            handleChange("additionalInfo", e.target.value)
                          }
                          className="mt-2 w-full p-2 border border-gray-300 rounded-md"
                          placeholder="Enter your text here"
                        />
                      </div>

                      <button
                        onClick={(e) => handleUpload(e)}
                        type="submit"
                        className="px-4 py-2 inline-block w-fit bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Submit
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
                          {response.map((product: any, index) => (
                            <ProductCard
                              key={product.Image}
                              title={product["Product Name"]}
                              imageURL={product.Image}
                              price={product["Price"]}
                              mode={mode}
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
  price: string;
  imageURL: string;
  mode:string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  mode,
  title,
  price,
  imageURL,
}) => {
  let imageURLFinal
  if(mode == "StyledGenie"){
    imageURLFinal = "https://static.wixstatic.com/media/" + imageURL;
  }else{
    imageURLFinal = imageURL
  }
  return (
    <div className="max-w-xs rounded-lg shadow-lg bg-white transition-transform transform hover:scale-105">
      <img
        className="w-full h-56 object-contain"
        src={imageURLFinal}
        alt={title}
      />
      <div className="px-6 pt-4">
        <div className="font-bold text-xl">{title}</div>
      </div>
      <div className="px-6 pb-4">
        <span className="text-gray-900 font-bold text-lg">{`€ ${price}`}</span>
      </div>
    </div>
  );
};

export default StyledGenieProductRecommendation;
