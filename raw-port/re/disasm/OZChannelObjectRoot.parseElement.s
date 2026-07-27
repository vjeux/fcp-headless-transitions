__ZN19OZChannelObjectRoot12parseElementER22PCSerializerReadStreamR15PCStreamElement:
0000000000217d60	pushq	%rbp
0000000000217d61	movq	%rsp, %rbp
0000000000217d64	pushq	%r15
0000000000217d66	pushq	%r14
0000000000217d68	pushq	%r12
0000000000217d6a	pushq	%rbx
0000000000217d6b	movq	%rdx, %r15
0000000000217d6e	movq	%rsi, %rbx
0000000000217d71	movq	%rdi, %r14
0000000000217d74	callq	0x6de7ba                        ## symbol stub for: __ZN23OZChannelObjectRootBase12parseElementER22PCSerializerReadStreamR15PCStreamElement
0000000000217d79	cmpl	$0x48, 0x8(%r15)
0000000000217d7e	jne	0x217dd9
0000000000217d80	movq	0xd8(%r14), %r15
0000000000217d87	testq	%r15, %r15
0000000000217d8a	je	0x217db2
0000000000217d8c	leaq	0x8(%r15), %rdi
0000000000217d90	leaq	0x10(%r15), %r12
0000000000217d94	movq	0x10(%r15), %rsi
0000000000217d98	callq	__ZNSt3__16__treeI12OZTimeMarkerNS_4lessIS1_EENS_9allocatorIS1_EEE7destroyEPNS_11__tree_nodeIS1_PvEE ## std::__1::__tree<OZTimeMarker, std::__1::less<OZTimeMarker>, std::__1::allocator<OZTimeMarker>>::destroy(std::__1::__tree_node<OZTimeMarker, void*>*)
0000000000217d9d	movq	%r12, 0x8(%r15)
0000000000217da1	xorps	%xmm0, %xmm0
0000000000217da4	movups	%xmm0, 0x10(%r15)
0000000000217da9	movq	0xd8(%r14), %r15
0000000000217db0	jmp	0x217dce
0000000000217db2	movl	$0x20, %edi
0000000000217db7	callq	0x6dfca2                        ## symbol stub for: __Znwm
0000000000217dbc	movq	%rax, %r15
0000000000217dbf	movq	%rax, %rdi
0000000000217dc2	callq	__ZN15OZTimeMarkerSetC1Ev       ## OZTimeMarkerSet::OZTimeMarkerSet()
0000000000217dc7	movq	%r15, 0xd8(%r14)
0000000000217dce	movq	%rbx, %rdi
0000000000217dd1	movq	%r15, %rsi
0000000000217dd4	callq	0x6de790                        ## symbol stub for: __ZN22PCSerializerReadStream11pushHandlerEP12PCSerializer
0000000000217dd9	movb	$0x1, %al
0000000000217ddb	popq	%rbx
0000000000217ddc	popq	%r12
0000000000217dde	popq	%r14
0000000000217de0	popq	%r15
0000000000217de2	popq	%rbp
0000000000217de3	retq
0000000000217de4	movq	%rax, %rbx
0000000000217de7	movq	%r15, %rdi
0000000000217dea	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
0000000000217def	movq	%rbx, %rdi
0000000000217df2	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
0000000000217df7	nopw	(%rax,%rax)
