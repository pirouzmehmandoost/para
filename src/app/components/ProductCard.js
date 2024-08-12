import Image from 'next/image'
 
export default function ProductCard( {props} ) {

    const {
        url,
        name,
        price,
        productType,
    } = props

    return (
        <div 
        id="product_card"
        className="w-full flex flex-col relative  backdrop-blur-3xl  backdrop-brightness-100 justify-between items-center text-center"
        >
            <div>
                <Image
                className="bg-cover overflow-auto"
                loading="lazy"
                src={url}
                width={400}
                height={600}
                alt={name}
                />
            </div>
 
            <div className= "z-10 w-full" > 
                <p> {name} </p>
                <p> {price} </p>
            </div>
        </div>
    )
}