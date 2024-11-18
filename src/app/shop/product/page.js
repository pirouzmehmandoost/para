"use client";
import Image from 'next/image'
import useSelection from '../../store/selection';
import ShopMenu from "./../../components/ShopMenu"

const ProductViewer = () => {
    const selection = useSelection(state => state.selection)
    const { imgUrl, name } = selection;
    let count = 0;
    const imageGrid = [];

    while (count < imgUrl.length) {
        const subArr = [];
        if (count % 2 === 1) {
            subArr.push(imgUrl[count]);
            count++;
        };
        if (imgUrl[count]) {
            subArr.push(imgUrl[count]);
            count++;
        };
        imageGrid.push(subArr);
    };

    return (
        <div
            id="product_viewer"
            className="w-full h-full flex flex-col relative  bg-transparent justify-between items-center text-center"
        >
            {
                imageGrid.map((images, index) => {
                    return (
                        <div key={"image_column_" + index} className="flex flex-col">
                            <div key={"image_row_" + index} className="flex flex-row">
                                {
                                    images.map((image, imageIndex) => {
                                        return (
                                            <Image
                                                priority
                                                key={`${imageIndex}_${image}`}
                                                className="bg-cover overflow-auto"
                                                // loading="lazy"
                                                src={image}
                                                width={1920}
                                                height={1080}
                                                alt={name}
                                                quality={100}
                                            />
                                        )
                                    })
                                }
                            </div >
                        </div>
                    )
                })
            }

            <ShopMenu />
        </div >
    );
};

export default ProductViewer;