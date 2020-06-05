import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { Link, useHistory } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { Map, TileLayer, Marker } from "react-leaflet";
import axios from "axios";
import { LeafletMouseEvent } from "leaflet";
import api from "../../services/api";

import Dropzone from "../../components/Dropzone";
import "./styles.css";

import Logotipo from "../../assets/logo.svg";

import Item from "./../../models/Item";
import Uf from "../../models/Uf";
import City from "../../models/City";

const CreatePoint = () => {
  const history = useHistory();
  const [items, setItems] = useState<Array<Item>>([]);
  const [ufs, setUfs] = useState<Array<Uf>>([]);
  const [cities, setCities] = useState<Array<City>>([]);
  const [initialPosition, setInitialPosition] = useState<[number, number]>([
    0,
    0,
  ]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
  });
  const [selectedUf, setSelectedUf] = useState<string>();
  const [selectedCity, setSelectedCity] = useState<string>();
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([
    0,
    0,
  ]);
  const [selectedItems, setselectedItems] = useState<Array<number>>([]);
  const [selectedFile, setSelectedFile] = useState<File>();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      setInitialPosition([latitude, longitude]);
    });
  }, []);

  useEffect(() => {
    api.get("/items").then((response) => {
      setItems(response.data);
    });
  }, []);

  useEffect(() => {
    axios
      .get("https://servicodados.ibge.gov.br/api/v1/localidades/estados")
      .then((response) => {
        setUfs(response.data);
      });
  }, []);

  useEffect(() => {
    if (selectedUf) {
      axios
        .get(
          `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`
        )
        .then((response) => {
          setCities(response.data);
        });
    }
  }, [selectedUf]);

  const handleUf = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedUf(event.target.value);
  };

  const handleCity = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedCity(event.target.value);
  };

  const handleMapClick = (event: LeafletMouseEvent) => {
    setSelectedPosition([event.latlng.lat, event.latlng.lng]);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSelectItem = (item: Item) => {
    const alreadySelected = selectedItems.findIndex((i) => i === item.id);
    if (alreadySelected >= 0) {
      const filteredItems = selectedItems.filter((i) => i !== item.id);
      setselectedItems(filteredItems);
    } else {
      setselectedItems([...selectedItems, item.id]);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const data = new FormData();
    data.append("name", formData.name);
    data.append("email", formData.email);
    data.append("whatsapp", formData.whatsapp);
    data.append("uf", String(selectedUf));
    data.append("city", String(selectedCity));
    data.append("latitude", String(selectedPosition[0]));
    data.append("longitude", String(selectedPosition[1]));
    data.append("items", selectedItems.join(","));
    if (selectedFile) {
      data.append("image", selectedFile);
    }

    await api.post("/points", data);
    alert("Ponto de coleta criado!");
    history.push("/");
  };

  return (
    <div id="page-create-point">
      <header>
        <img src={Logotipo} alt="Ecoleta" />
        <Link to="/">
          <FiArrowLeft />
          Voltar para home
        </Link>
      </header>
      <form onSubmit={handleSubmit}>
        <h1>
          Cadastro do <br /> ponto de coleta
        </h1>

        <Dropzone onFileUploaded={setSelectedFile} />

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>
          <div className="field">
            <label htmlFor="name">Nome da entidade:</label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleInputChange}
            />
          </div>

          <div className="field-group">
            <div className="field">
              <label htmlFor="email">E-mail:</label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            <div className="field">
              <label htmlFor="whatsapp">Whatsapp:</label>
              <input
                type="text"
                name="whatsapp"
                id="whatsapp"
                value={formData.whatsapp}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no mapa</span>
          </legend>

          <Map center={initialPosition} zoom={15} onclick={handleMapClick}>
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={selectedPosition} />
          </Map>

          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado (UF)</label>
              <select name="uf" id="uf" value={selectedUf} onChange={handleUf}>
                <option key={`uf-null`} value="">
                  Selecione um estado
                </option>
                {ufs.map((uf) => {
                  return (
                    <option key={`uf-${uf.id}`} value={uf.sigla}>
                      {uf.nome}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select
                name="city"
                id="city"
                value={selectedCity}
                onChange={handleCity}
              >
                <option key="city-null" value="">
                  Selecione uma cidade
                </option>
                {cities.map((city) => {
                  return (
                    <option key={`city-${city.id}`} value={city.nome}>
                      {city.nome}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Itens de coleta</h2>
            <span>Selecione um ou mais items abaixo</span>
          </legend>
          <ul className="items-grid">
            {items.map((item) => {
              return (
                <li
                  key={item.id}
                  className={selectedItems.includes(item.id) ? "selected" : ""}
                  onClick={() => handleSelectItem(item)}
                >
                  <img src={item.image} alt={item.title} />
                  <span>{item.title}</span>
                </li>
              );
            })}
          </ul>
        </fieldset>
        <button type="submit">Cadastrar ponto de coleta</button>
      </form>
    </div>
  );
};

export default CreatePoint;
