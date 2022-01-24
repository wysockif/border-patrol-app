import * as React from 'react'
import {useState} from 'react'
import NavigationBar from "../components/NavigationBar";
import {uploadImageToStorage} from "../api/azure_storage_api/azureStorageApiCalls";
import {getPredictions, Prediction} from "../api/custom_vision_api/customVisionApiCalls";
import {Col, Input, Row, Spinner} from "reactstrap";
import {FileUploadCard} from "../components/FileUploadCard";
import Canvas from "../components/Canvas";

function App() {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [pendingApiCall, setPendingApiCall] = useState<boolean>(false);
    const [predictionsList, setPredictionsList] = useState<Prediction[][]>([]);
    const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
    const [error, setError] = useState<string>('');
    const [threshold, setThreshold] = useState<number>(50);

    let minProbability = threshold / 100;

    const onFileChange = (event: any) => {
        setError('');
        setSelectedFiles([]);
        setUploadedImageUrls([])
        setPredictionsList([]);
        setSelectedFiles([]);

        if (event.target.files[0] === undefined) {
            setError('Any file was uploaded!');
            return;
        }

        for (let i = 0; i < event.target.files.length; i++) {
            const name = event.target.files[i].name;
            const lastDot = name.lastIndexOf('.');
            const ext = name.substring(lastDot + 1);

            if (ext === 'png' || ext === 'jpg' || ext === 'jpeg') {
                let files: File[] = selectedFiles;
                files.push(event.target.files[i]);
                setSelectedFiles(files);
            } else {
                setError('Unsupported file extension!');
                event.target.value = null;
            }
        }
    };

    const onFileUpload = async () => {
        setError('');
        setPredictionsList([]);
        setUploadedImageUrls([]);
        setPendingApiCall(true);

        if (!selectedFiles.length) {
            setError('Any file was uploaded!');
            return;
        }

        for (let i = 0; i < selectedFiles.length; i++) {
            uploadImageToStorage(selectedFiles[i])
                .then(url => {
                    return getPredictions(url)
                        .then(response => {
                            let urls = uploadedImageUrls;
                            urls.push(url);
                            setUploadedImageUrls(urls);
                            let predictionList = predictionsList;
                            predictionList.push(response.data.predictions);
                            setPredictionsList(predictionList);
                            if (i + 1 === selectedFiles.length){
                                setTimeout(() => {
                                    setPendingApiCall(false);
                                    setTimeout(() => {
                                        setSelectedFiles([]);
                                    }, 80);
                                }, 80);
                            }
                        });
                }).catch(error => {
                setPendingApiCall(false);
                setError('Invalid image content!')
                console.error(error)
            });
        }
    };

    return (
        <div className="mb-3">
            <NavigationBar/>
            <div className="d-flex justify-content-center">
                <div className="content-container">
                    <FileUploadCard onFileChange={onFileChange} onFileUpload={onFileUpload}/>
                    <Col className="ms-2">
                        <Row className="d-flex justify-content-center">
                            <Col md="9" >
                                <div className="text-center">
                                    Threshold: {threshold} %
                                </div>
                                <Input type="range" className="form-range" id="customRange1" min="1" max="100" step="1"
                                       defaultValue="50" onChange={(ev) => setThreshold(parseInt(ev.target.value))}/>
                            </Col>
                        </Row>
                    </Col>
                    {predictionsList.length === uploadedImageUrls.length && predictionsList.map((predictions, index) =>
                        <div className="mt-2" style={{minHeight: "60vh"}} key={predictions.toString()}>
                            <Row>
                                {(pendingApiCall || (!pendingApiCall && !uploadedImageUrls.length && !uploadedImageUrls[index].length) || error) &&
                                <Col className="col-12 d-flex flex-wrap align-items-center" style={{minHeight: "56vh"}}>
                                    {/*{pendingApiCall && !error && <div className="text-center mx-auto"><Spinner>*/}
                                    {/*    Loading...*/}
                                    {/*</Spinner></div>}*/}
                                    {!pendingApiCall && !uploadedImageUrls.length &&  !uploadedImageUrls[index].length &&!error &&
                                    <div className="text-muted text-center mx-auto">
                                        Here you will see the predictions
                                    </div>}
                                    {error && <div className="text-danger text-center mx-auto">
                                        {error}
                                    </div>}
                                </Col>}

                                <Col className="align-self-center mb-3">
                                    {predictions.length > 0 && <div>
                                        <h4><p>Predictions:</p></h4>
                                        <li className="text-danger">Human
                                            found {predictions.filter(p => p.tagName === 'Human' && p.probability > minProbability).length} times
                                        </li>
                                        <li className="text-primary">Dog
                                            found {predictions.filter(p => p.tagName === 'Dog' && p.probability > minProbability).length} times
                                        </li>
                                    </div>}
                                </Col>
                                {(uploadedImageUrls[index]) && <Row>
                                    <Col style={{minHeight: "56vh"}}>
                                        {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
                                        <Canvas uploadedImageUrl={uploadedImageUrls[index]} predictions={predictions} width="700"
                                                height="700" minProbability={minProbability}/>
                                    </Col>
                                </Row>}
                            </Row>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default App;