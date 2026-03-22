function ProfessionnalAccountValidationList() {


  return (
    <>
        <div className="flex flex-col items-center p-4 min-h-screen">
            <h1 className="font-bold text-2xl mt-6">Validation des comptes professionnels</h1>
            <p className="text-gray-500 text-center mt-2">Gérez les comptes professionnels en attente de validation</p>



            {/* Liste défilante des laveries // Test laveries a revoir !!!!!!!!!!!!! */}
            {/* <div className="w-full max-w-md mt-6 overflow-y-auto max-h-[800px]"> */}


            {/* cards 1 */}
            <div
                className="bg-white border border-gray-200 shadow-md w-full max-w-sm rounded-lg overflow-hidden mx-auto mt-4">
                <div className="p-6">
                    <div>
                        <h3 className="text-lg font-semibold">Heading</h3>
                        <p className="mt-2 text-sm text-slate-500 leading-relaxed">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed auctor auctor
                            arcu, at fermentum dui. Maecenas</p>
                    </div>
                    <button type="button"
                        className="mt-6 px-5 py-2 rounded-md text-white text-sm font-medium tracking-wider border-none outline-none bg-blue-600 hover:bg-blue-700 cursor-pointer">View</button>
                </div>
            </div>

            {/* cards 2 */}
            <div className="bg-white border border-gray-200 shadow-md p-6 w-full max-w-sm rounded-lg overflow-hidden mx-auto mt-4">

                <div className="inline-block bg-[#edf2f7] rounded-lg py-2 px-3 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-8" viewBox="0 0 511.999 511.999">
                    </svg>
                </div>

                <div className="mt-4 inline-block">
                    <h3 className="text-xl font-semibold text-slate-900">Francois Lambert</h3>
                    <p className="mt-1 text-sm text-slate-500">Lorem ipsum dolor sit amet, consectetur.</p>
                </div>

                <div className="mt-4">
                    <h3 className="text-l font-semibold text-slate-900 inline">Entrprise : </h3>
                    <p className="mt-2 text-md text-slate-500 inline">Autolave</p>
                </div>

                <div className="mt-4">
                    <h3 className="text-l font-semibold text-slate-900 inline">Siret : </h3>
                    <p className="mt-2 text-md text-slate-500 inline">456445415664</p>
                </div>

                <button type="button"
                    className="mt-6 px-5 py-2 rounded-md text-white text-sm font-medium tracking-wider border-none outline-none bg-blue-600 hover:bg-blue-700 cursor-pointer">
                    Voir
                </button>

            </div>

            {/* </div> */}
        </div>
    
    </>
  );
}

export default ProfessionnalAccountValidationList;