import React, {useState} from 'react';
import {Button} from "strapi-helper-plugin";
import {saveAs} from "file-saver";
import {fetchEntries} from "../../utils/contentApis";
import {HFlex, ModelItem} from "./ui-components";
import JsonDataDisplay from "../../components/JsonDataDisplay";

import XLSX from 'xlsx';

const ExportModel = ({model}) => {
  const [fetching, setFetching] = useState(false);
  const [content, setContent] = useState(null);
  const fetchModelData = () => {
    setFetching(true);
    fetchEntries(model.apiID, model.schema.kind).then((data) => {
      setContent(data);
    }).finally(() => {
      setFetching(false);
    });
  };

  const downloadJson = () => {
    const current = new Date();
    const file = new File([JSON.stringify(content)],
      `${model.apiID}-${current.getTime()}.json`,
      {type: "application/json;charset=utf-8"});
    saveAs(file);
  };

  const downloadXsl = () => {
    const current = new Date();
    const ws = XLSX.utils.json_to_sheet(JSON.parse(JSON.stringify(content)));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `data`);
    XLSX.writeFile(wb, `${model.apiID}-${current.getTime()}.xlsx`);

  };

  const downloadCsv = () => {
    let arr = JSON.parse(JSON.stringify(content));
    let keys = [];
    let values = [];
    function getKeys(data, k = '') {
      for (let i in data) {
        let rest = k.length ? '_' + i : i
        if (typeof data[i] == 'object') {
          if (!Array.isArray(data[i])) {
            getKeys(data[i], k + rest)
          }
        } else keys.push( k+ rest)
      }
    }
    function getValues(data, k = '') {
      for (var i in data) {
        var rest = k.length ? '' + i : i
        if (typeof data[i] == 'object') {
          if (!Array.isArray(data[i])) {
            getValues(data[i], k + rest)
          }
        }
        else values.push(data[rest])
      }
    }

    getKeys(arr[0])
    var value="";
    arr.forEach(x=>{
      values=[];
      getValues(x);
      value+=values.join(";")+"\r\n";
    })

    let result = keys.join(";")+"\r\n"+value;
    let fileToSave = new Blob([result], {
      type: "csv",
      name: `${model.apiID}-${current.getTime()}.xlsx`
    });

    saveAs(fileToSave, `${model.apiID}-${current.getTime()}.xlsx`);
  }



  return (<ModelItem>
    <HFlex>
      <span className='title'>{model.schema.name}</span>
      <div>
        <Button disabled={fetching}
                loader={fetching}
                onClick={fetchModelData}
                secondaryHotline>{fetching ? "Fetching" : "Fetch"}</Button>
        <Button disabled={!content}
                onClick={downloadJson}
                kind={content ? 'secondaryHotline' : 'secondary'}
        >Download Json</Button>

        <Button disabled={!content}
                onClick={downloadXsl}
                kind={content ? 'secondaryHotline' : 'secondary'}
        >Download Excel</Button>

        <Button disabled={!content}
                onClick={downloadCsv}
                kind={content ? 'secondaryHotline' : 'secondary'}
        >Download CSV</Button>

      </div>
    </HFlex>
    {
      content && (<JsonDataDisplay data={content}/>)
    }
  </ModelItem>)
};

export default ExportModel;
