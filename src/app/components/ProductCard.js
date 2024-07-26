import Image from 'next/image'
 
export default function ProductCard( props ) {

    console.log("these props are passed to ProductCard", props)
    const {
        url,
        name,
        price,
        productType,
    } = props.data

    return (
        <div className=" static flex flex-row justify-between items-center text-center">
            <div className="relative">
                <h2> name: {name}</h2>
                <h2> price: {price}</h2>
                <h2> url: {url} </h2>
                

                    <div className = "absolute">   
                        <Image
                        className="relative"
                        src={url}
                        width={500}
                        height={500}
                        alt="A Product"
                        />
                    </div>
            </div>

           
        </div>
    )
}