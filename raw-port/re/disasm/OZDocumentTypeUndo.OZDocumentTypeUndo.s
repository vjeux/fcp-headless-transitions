__ZN18OZDocumentTypeUndoC1EP10OZDocumentRK24OZDocumentTypeUndoParams:
00000000001028c0	pushq	%rbp
00000000001028c1	movq	%rsp, %rbp
00000000001028c4	pushq	%r15
00000000001028c6	pushq	%r14
00000000001028c8	pushq	%rbx
00000000001028c9	pushq	%rax
00000000001028ca	movq	%rdx, %r14
00000000001028cd	movq	%rdi, %rbx
00000000001028d0	leaq	0x73ae41(%rip), %rax
00000000001028d7	movq	%rax, (%rdi)
00000000001028da	leaq	0x10(%rdi), %r15
00000000001028de	xorps	%xmm0, %xmm0
00000000001028e1	movups	%xmm0, 0x18(%rdi)
00000000001028e5	movups	%xmm0, 0x28(%rdi)
00000000001028e9	movups	%xmm0, 0x38(%rdi)
00000000001028ed	movups	%xmm0, 0x4c(%rdi)
00000000001028f1	movq	$0x0, 0x59(%rdi)
00000000001028f9	movq	%rsi, 0x8(%rdi)
00000000001028fd	movl	(%rdx), %eax
00000000001028ff	movl	%eax, 0x10(%rdi)
0000000000102902	cmpq	%rdx, %r15
0000000000102905	je	0x10294b
0000000000102907	leaq	0x18(%rbx), %rdi
000000000010290b	movq	0x8(%r14), %rsi
000000000010290f	movq	0x10(%r14), %rdx
0000000000102913	movq	%rdx, %rcx
0000000000102916	subq	%rsi, %rcx
0000000000102919	sarq	$0x2, %rcx
000000000010291d	callq	__ZNSt3__16vectorIjNS_9allocatorIjEEE18__assign_with_sizeB9nqe210106IPjS5_EEvT_T0_l ## void std::__1::vector<unsigned int, std::__1::allocator<unsigned int>>::__assign_with_size[abi:nqe210106]<unsigned int*, unsigned int*>(unsigned int*, unsigned int*, long)
0000000000102922	leaq	0x30(%rbx), %rdi
0000000000102926	movq	0x20(%r14), %rsi
000000000010292a	movq	0x28(%r14), %rdx
000000000010292e	movq	%rdx, %rax
0000000000102931	subq	%rsi, %rax
0000000000102934	sarq	$0x5, %rax
0000000000102938	movabsq	$0x6db6db6db6db6db7, %rcx       ## imm = 0x6DB6DB6DB6DB6DB7
0000000000102942	imulq	%rax, %rcx
0000000000102946	callq	__ZNSt3__16vectorI24OZDropZoneTypeUndoParamsNS_9allocatorIS1_EEE18__assign_with_sizeB9nqe210106IPS1_S6_EEvT_T0_l ## void std::__1::vector<OZDropZoneTypeUndoParams, std::__1::allocator<OZDropZoneTypeUndoParams>>::__assign_with_size[abi:nqe210106]<OZDropZoneTypeUndoParams*, OZDropZoneTypeUndoParams*>(OZDropZoneTypeUndoParams*, OZDropZoneTypeUndoParams*, long)
000000000010294b	movups	0x38(%r14), %xmm0
0000000000102950	movups	0x41(%r14), %xmm1
0000000000102955	movups	%xmm1, 0x51(%rbx)
0000000000102959	movups	%xmm0, 0x48(%rbx)
000000000010295d	addq	$0x8, %rsp
0000000000102961	popq	%rbx
0000000000102962	popq	%r14
0000000000102964	popq	%r15
0000000000102966	popq	%rbp
0000000000102967	retq
0000000000102968	movq	%rax, %rbx
000000000010296b	movq	%r15, %rdi
000000000010296e	callq	__ZN24OZDocumentTypeUndoParamsD1Ev ## OZDocumentTypeUndoParams::~OZDocumentTypeUndoParams()
0000000000102973	movq	%rbx, %rdi
0000000000102976	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
000000000010297b	nopl	(%rax,%rax)
