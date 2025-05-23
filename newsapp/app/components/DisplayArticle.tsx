"use client";
import React from "react";
import { useSingleArticle } from "../hooks/useSingleArticle";
// import { useBiasPrediction } from "../hooks/useBiasPrediction"; // no longer needed, not rating on the fly anymore

interface DisplayArticleProps {
  source: string;
  title: string;
}

const DisplayArticle: React.FC<DisplayArticleProps> = ({ source, title }) => {
  const { article, loading, error } = useSingleArticle(source, title);

  if (loading) return <p className="text-gray-500">Loading article...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (!article) return null;

  return (
    <div className="mt-6 p-6 rounded-2xl bg-white shadow-md space-y-6 border border-gray-200">
      {/* 🖼️ Image */}
      {/* {article.imageUrl && ( */}
        <img
          // src={article.imageUrl}
          src={article.imageUrl}
          alt="Article Image"
          className="w-full h-64 object-cover rounded-lg"
        />
      {/* )} */}

      {/* 📰 Title + Meta */}
      <div>
        <h2 className="text-3xl font-bold mb-2 text-gray-900">{article.articleName}</h2>
        {article.author && (
          <p className="text-sm text-gray-600 mb-1">
          <span className="font-medium">By {article.author}</span>
          <span className="mx-2 text-gray-400">|</span>
          <span>Published: {article.datePublished instanceof Date ? article.datePublished.toLocaleDateString() : article.datePublished}</span>
        </p>
        
        )}
        {article.link && (
          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline text-sm"
          >
            Read original article →
          </a>
        )}
      </div>

      {/* 🧠 Summary (placeholder for DB content) */}
      <div className="bg-gray-50 p-4 rounded-lg border">
        <h3 className="text-md font-semibold text-gray-700 mb-1">Summary</h3>
        <p className="text-sm text-gray-700">
          {/* Replace this with DB-powered summary */}
          {article.summary || "No summary available."}
        </p>
      </div>

      {/* 🧭 Bias from Database */}
  <div className="pt-4 border-t">
    <h3 className="text-lg font-semibold mb-2 text-gray-800">Bias Detection</h3>
    {article.biasRating ? (
      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
        article.biasRating === "Left" ? "bg-red-100 text-red-800" :
        article.biasRating === "Right" ? "bg-blue-100 text-blue-800" :
        "bg-gray-100 text-gray-800"
      }`}>
        Bias: {article.biasRating}
      </span>
    ) : (
      <p className="text-sm text-gray-500 italic">Bias: Not found</p>
    )}
  </div>

    </div>
  );
};

export default DisplayArticle;
