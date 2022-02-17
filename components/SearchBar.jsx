import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'

export default function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('')

  const handleChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleSearch = (e) => {
      alert(searchTerm)
  }
    
  return (
    <div className="search-bar">
        <FontAwesomeIcon icon={faMagnifyingGlass} className="search-icon"/>
        <input className="search" type="text" name="search" placeholder="Search..." value={searchTerm} onChange={handleChange}/>
        <button className="btn-search" onClick={handleSearch}>Search</button>
    </div>
  )
}
