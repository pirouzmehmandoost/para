"use client";
import Image from 'next/image'
import useSelection from '../../store/selection';
import ShopMenu from "./../../components/ShopMenu"

const ProductViewer = () => {
    const selection = useSelection(state => state.selection);

    const {
        imgUrls = {},
        name
    } = selection;

    let count = 0;
    let numRows = 1;

    const imageGrid = [];
    const flattenedUrls = Object.values(imgUrls).flat();


    while (count < flattenedUrls.length) {
        const subArr = [];
        if (numRows % 2 === 0 && flattenedUrls[count]) {
            subArr.push(flattenedUrls[count]);
            count++;
            numRows++;
        }
        else {
            numRows--;
        };

        if (flattenedUrls[count]) {
            subArr.push(flattenedUrls[count]);
            count++;
        };
        imageGrid.push(subArr);

    };

    console.table(imageGrid)

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