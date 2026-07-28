__ZN36HGComicLookupFilterLUTBitmapResourceC2EN10HGComicLUT8LUTIndexE:
000000000003c520	pushq	%rbp
000000000003c521	movq	%rsp, %rbp
000000000003c524	pushq	%r15
000000000003c526	pushq	%r14
000000000003c528	pushq	%rbx
000000000003c529	pushq	%rax
000000000003c52a	movl	%esi, %r14d
000000000003c52d	movq	%rdi, %rbx
000000000003c530	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
000000000003c535	leaq	0x9c9d2c(%rip), %rax
000000000003c53c	movq	%rax, (%rbx)
000000000003c53f	movq	$0x0, 0x198(%rbx)
000000000003c54a	movl	$0x10, %edi
000000000003c54f	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
000000000003c554	movq	%rax, %r15
000000000003c557	movq	%rax, %rdi
000000000003c55a	movl	%r14d, %esi
000000000003c55d	callq	__ZN50HGComicLookupFilterLUTBitmapResourceImplementationC2EN10HGComicLUT8LUTIndexE ## HGComicLookupFilterLUTBitmapResourceImplementation::HGComicLookupFilterLUTBitmapResourceImplementation(HGComicLUT::LUTIndex)
000000000003c562	movq	%r15, 0x1a0(%rbx)
000000000003c569	addq	$0x8, %rsp
000000000003c56d	popq	%rbx
000000000003c56e	popq	%r14
000000000003c570	popq	%r15
000000000003c572	popq	%rbp
000000000003c573	retq
000000000003c574	movq	%rax, %r14
000000000003c577	movq	%r15, %rdi
000000000003c57a	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
000000000003c57f	jmp	0x3c584
000000000003c581	movq	%rax, %r14
000000000003c584	movq	0x198(%rbx), %rdi
000000000003c58b	testq	%rdi, %rdi
000000000003c58e	je	0x3c596
000000000003c590	movq	(%rdi), %rax
000000000003c593	callq	*0x18(%rax)
000000000003c596	movq	%rbx, %rdi
000000000003c599	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
000000000003c59e	movq	%r14, %rdi
000000000003c5a1	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
000000000003c5a6	movq	%rax, %rdi
000000000003c5a9	callq	___clang_call_terminate
000000000003c5ae	nop
__ZN36HGComicLookupFilterLUTBitmapResourceC1EN10HGComicLUT8LUTIndexE:
000000000003c5b0	pushq	%rbp
000000000003c5b1	movq	%rsp, %rbp
000000000003c5b4	pushq	%r15
000000000003c5b6	pushq	%r14
000000000003c5b8	pushq	%rbx
000000000003c5b9	pushq	%rax
000000000003c5ba	movl	%esi, %r14d
000000000003c5bd	movq	%rdi, %rbx
000000000003c5c0	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
000000000003c5c5	leaq	0x9c9c9c(%rip), %rax
000000000003c5cc	movq	%rax, (%rbx)
000000000003c5cf	movq	$0x0, 0x198(%rbx)
000000000003c5da	movl	$0x10, %edi
000000000003c5df	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
000000000003c5e4	movq	%rax, %r15
000000000003c5e7	movq	%rax, %rdi
000000000003c5ea	movl	%r14d, %esi
000000000003c5ed	callq	__ZN50HGComicLookupFilterLUTBitmapResourceImplementationC2EN10HGComicLUT8LUTIndexE ## HGComicLookupFilterLUTBitmapResourceImplementation::HGComicLookupFilterLUTBitmapResourceImplementation(HGComicLUT::LUTIndex)
000000000003c5f2	movq	%r15, 0x1a0(%rbx)
000000000003c5f9	addq	$0x8, %rsp
000000000003c5fd	popq	%rbx
000000000003c5fe	popq	%r14
000000000003c600	popq	%r15
000000000003c602	popq	%rbp
000000000003c603	retq
000000000003c604	movq	%rax, %r14
000000000003c607	movq	%r15, %rdi
000000000003c60a	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
000000000003c60f	jmp	0x3c614
000000000003c611	movq	%rax, %r14
000000000003c614	movq	0x198(%rbx), %rdi
000000000003c61b	testq	%rdi, %rdi
000000000003c61e	je	0x3c626
000000000003c620	movq	(%rdi), %rax
000000000003c623	callq	*0x18(%rax)
000000000003c626	movq	%rbx, %rdi
000000000003c629	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
000000000003c62e	movq	%r14, %rdi
000000000003c631	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
000000000003c636	movq	%rax, %rdi
000000000003c639	callq	___clang_call_terminate
000000000003c63e	nop
__ZN36HGComicLookupFilterLUTBitmapResourceD2Ev:
000000000003c640	pushq	%rbp
000000000003c641	movq	%rsp, %rbp
000000000003c644	pushq	%rbx
000000000003c645	pushq	%rax
000000000003c646	movq	%rdi, %rbx
000000000003c649	leaq	0x9c9c18(%rip), %rax
000000000003c650	movq	%rax, (%rdi)
000000000003c653	movq	0x1a0(%rdi), %rdi
000000000003c65a	testq	%rdi, %rdi
000000000003c65d	je	0x3c665
000000000003c65f	movq	(%rdi), %rax
000000000003c662	callq	*0x18(%rax)
000000000003c665	movq	0x198(%rbx), %rdi
000000000003c66c	testq	%rdi, %rdi
000000000003c66f	je	0x3c677
000000000003c671	movq	(%rdi), %rax
000000000003c674	callq	*0x18(%rax)
000000000003c677	movq	%rbx, %rdi
000000000003c67a	addq	$0x8, %rsp
000000000003c67e	popq	%rbx
000000000003c67f	popq	%rbp
000000000003c680	jmp	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
000000000003c685	movq	%rax, %rdi
000000000003c688	callq	___clang_call_terminate
000000000003c68d	movq	%rax, %rdi
000000000003c690	callq	___clang_call_terminate
000000000003c695	nopw	%cs:(%rax,%rax)
__ZN36HGComicLookupFilterLUTBitmapResourceD1Ev:
000000000003c6a0	pushq	%rbp
000000000003c6a1	movq	%rsp, %rbp
000000000003c6a4	pushq	%rbx
000000000003c6a5	pushq	%rax
000000000003c6a6	movq	%rdi, %rbx
000000000003c6a9	leaq	0x9c9bb8(%rip), %rax
000000000003c6b0	movq	%rax, (%rdi)
000000000003c6b3	movq	0x1a0(%rdi), %rdi
000000000003c6ba	testq	%rdi, %rdi
000000000003c6bd	je	0x3c6c5
000000000003c6bf	movq	(%rdi), %rax
000000000003c6c2	callq	*0x18(%rax)
000000000003c6c5	movq	0x198(%rbx), %rdi
000000000003c6cc	testq	%rdi, %rdi
000000000003c6cf	je	0x3c6d7
000000000003c6d1	movq	(%rdi), %rax
000000000003c6d4	callq	*0x18(%rax)
000000000003c6d7	movq	%rbx, %rdi
000000000003c6da	addq	$0x8, %rsp
000000000003c6de	popq	%rbx
000000000003c6df	popq	%rbp
000000000003c6e0	jmp	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
000000000003c6e5	movq	%rax, %rdi
000000000003c6e8	callq	___clang_call_terminate
000000000003c6ed	movq	%rax, %rdi
000000000003c6f0	callq	___clang_call_terminate
000000000003c6f5	nopw	%cs:(%rax,%rax)
__ZN36HGComicLookupFilterLUTBitmapResourceD0Ev:
000000000003c700	pushq	%rbp
000000000003c701	movq	%rsp, %rbp
000000000003c704	pushq	%rbx
000000000003c705	pushq	%rax
000000000003c706	movq	%rdi, %rbx
000000000003c709	leaq	0x9c9b58(%rip), %rax
000000000003c710	movq	%rax, (%rdi)
000000000003c713	movq	0x1a0(%rdi), %rdi
000000000003c71a	testq	%rdi, %rdi
000000000003c71d	je	0x3c725
000000000003c71f	movq	(%rdi), %rax
000000000003c722	callq	*0x18(%rax)
000000000003c725	movq	0x198(%rbx), %rdi
000000000003c72c	testq	%rdi, %rdi
000000000003c72f	je	0x3c737
000000000003c731	movq	(%rdi), %rax
000000000003c734	callq	*0x18(%rax)
000000000003c737	movq	%rbx, %rdi
000000000003c73a	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
000000000003c73f	movq	%rbx, %rdi
000000000003c742	addq	$0x8, %rsp
000000000003c746	popq	%rbx
000000000003c747	popq	%rbp
000000000003c748	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
000000000003c74d	movq	%rax, %rdi
000000000003c750	callq	___clang_call_terminate
000000000003c755	movq	%rax, %rdi
000000000003c758	callq	___clang_call_terminate
000000000003c75d	nopl	(%rax)
__ZN36HGComicLookupFilterLUTBitmapResource9GetOutputEP10HGRenderer:
000000000003c760	pushq	%rbp
000000000003c761	movq	%rsp, %rbp
000000000003c764	pushq	%r15
000000000003c766	pushq	%r14
000000000003c768	pushq	%rbx
000000000003c769	pushq	%rax
000000000003c76a	movq	%rdi, %r14
000000000003c76d	movq	0x1a0(%rdi), %rax
000000000003c774	movl	0xc(%rax), %esi
000000000003c777	leaq	-0x20(%rbp), %rdi
000000000003c77b	callq	__ZN50HGComicLookupFilterLUTBitmapResourceImplementation12getCachedLUTEi ## HGComicLookupFilterLUTBitmapResourceImplementation::getCachedLUT(int)
000000000003c780	movq	-0x20(%rbp), %r15
000000000003c784	movl	$0x1f0, %edi                    ## imm = 0x1F0
000000000003c789	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
000000000003c78e	movq	%rax, %rbx
000000000003c791	movq	%rax, %rdi
000000000003c794	movq	%r15, %rsi
000000000003c797	callq	__ZN14HGBitmapLoaderC1EP8HGBitmap ## HGBitmapLoader::HGBitmapLoader(HGBitmap*)
000000000003c79c	testq	%r15, %r15
000000000003c79f	je	0x3c7aa
000000000003c7a1	movq	(%r15), %rax
000000000003c7a4	movq	%r15, %rdi
000000000003c7a7	callq	*0x18(%rax)
000000000003c7aa	movq	0x198(%r14), %rdi
000000000003c7b1	cmpq	%rbx, %rdi
000000000003c7b4	je	0x3c7d8
000000000003c7b6	testq	%rdi, %rdi
000000000003c7b9	je	0x3c7c1
000000000003c7bb	movq	(%rdi), %rax
000000000003c7be	callq	*0x18(%rax)
000000000003c7c1	movq	%rbx, 0x198(%r14)
000000000003c7c8	testq	%rbx, %rbx
000000000003c7cb	je	0x3c7e6
000000000003c7cd	movq	(%rbx), %rax
000000000003c7d0	movq	%rbx, %rdi
000000000003c7d3	callq	*0x10(%rax)
000000000003c7d6	jmp	0x3c7dd
000000000003c7d8	testq	%rbx, %rbx
000000000003c7db	je	0x3c7e6
000000000003c7dd	movq	(%rbx), %rax
000000000003c7e0	movq	%rbx, %rdi
000000000003c7e3	callq	*0x18(%rax)
000000000003c7e6	movq	%rbx, %rax
000000000003c7e9	addq	$0x8, %rsp
000000000003c7ed	popq	%rbx
000000000003c7ee	popq	%r14
000000000003c7f0	popq	%r15
000000000003c7f2	popq	%rbp
000000000003c7f3	retq
000000000003c7f4	movq	%rax, %r14
000000000003c7f7	jmp	0x3c801
000000000003c7f9	movq	%rax, %r14
000000000003c7fc	testq	%rbx, %rbx
000000000003c7ff	je	0x3c842
000000000003c801	movq	(%rbx), %rax
000000000003c804	movq	%rbx, %rdi
000000000003c807	callq	*0x18(%rax)
000000000003c80a	jmp	0x3c842
000000000003c80c	movq	%rax, %rdi
000000000003c80f	callq	___clang_call_terminate
000000000003c814	movq	%rax, %rdi
000000000003c817	callq	___clang_call_terminate
000000000003c81c	movq	%rax, %rdi
000000000003c81f	callq	___clang_call_terminate
000000000003c824	movq	%rax, %r14
000000000003c827	movq	%rbx, %rdi
000000000003c82a	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
000000000003c82f	jmp	0x3c834
000000000003c831	movq	%rax, %r14
000000000003c834	testq	%r15, %r15
000000000003c837	je	0x3c842
000000000003c839	movq	(%r15), %rax
000000000003c83c	movq	%r15, %rdi
000000000003c83f	callq	*0x18(%rax)
000000000003c842	movq	%r14, %rdi
000000000003c845	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
000000000003c84a	movq	%rax, %rdi
000000000003c84d	callq	___clang_call_terminate
