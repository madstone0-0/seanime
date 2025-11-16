import {
    AL_BaseManga,
    HibikeManga_ChapterPage,
    Manga_EntryListData,
    Manga_PageContainer,
} from "@/api/generated/types";
import { __manga_selectedChapterAtom } from "../../_lib/handle-chapter-reader";
import { useAtom, useAtomValue } from "jotai/react";
import { useMangaReaderUtils } from "@/app/(main)/manga/_lib/handle-manga-utils";
import {
    __manga_currentPageIndexAtom,
    __manga_currentPaginationMapIndexAtom,
    __manga_hiddenBarAtom,
    __manga_pageFitAtom,
    __manga_pageStretchAtom,
    __manga_paginationMapAtom,
    __manga_readerProgressBarAtom,
    __manga_readingDirectionAtom,
    __manga_readingModeAtom,
} from "@/app/(main)/manga/_lib/manga-chapter-reader.atoms";
import { IconButton } from "@/components/ui/button";
import { LuDownload } from "react-icons/lu";
import { getServerBaseUrl } from "@/api/client/server-url";

type ChapterPageDownloadProps = {
    entry: {
        media?: AL_BaseManga | undefined;
        mediaId: number;
        listData?: Manga_EntryListData;
    };
    pageContainer: Manga_PageContainer;
};

export function ChapterPageDownload(props: ChapterPageDownloadProps) {
    const { entry, pageContainer } = props;

    const currentPageIndex = useAtomValue(__manga_currentPageIndexAtom);
    const selectedChapter = useAtomValue(__manga_selectedChapterAtom);

    const { getChapterPageUrl } = useMangaReaderUtils();

    const handleDownload = () => {
        let page: HibikeManga_ChapterPage | undefined = undefined;
        if (pageContainer.pages) {
            page = pageContainer.pages[currentPageIndex];
        }
        console.log({ page });

        // Download page named as chapterDownloadName
        if (!page?.url) return;

        fetch(getChapterPageUrl(page.url, false, page.headers)).then(
            async (res) => {
                const blob = await res.blob();
                const blobUrl = URL.createObjectURL(blob);
                const title =
                    entry?.media?.title?.userPreferred?.replace(/\s+/g, "_") ??
                    "file";
                const chapter = selectedChapter?.chapterNumber ?? 0;
                const index = currentPageIndex + 1;
                const suggestedName = `${title}_${chapter}_${index}.jpg`;

                const a = document.createElement("a");
                a.href = blobUrl;
                a.download = suggestedName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(blobUrl);
            },
        );
    };

    return (
        <div data-manga-reader-bar-page-container>
            <IconButton
                icon={<LuDownload />}
                onClick={() => handleDownload()}
                intent="gray-basic"
                className="outline-0"
                tabIndex={-1}
            />
        </div>
    );
}
