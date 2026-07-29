__ZNK21OZChannelColorNoAlpha15getDefaultColorER7PCColor:
0000000000056872	pushq	%rbp
0000000000056873	movq	%rsp, %rbp
0000000000056876	pushq	%r14
0000000000056878	pushq	%rbx
0000000000056879	subq	$0x20, %rsp
000000000005687d	movq	%rsi, %rbx
0000000000056880	movq	%rdi, %r14
0000000000056883	addq	$0x88, %rdi
000000000005688a	callq	__ZNK9OZChannel15getDefaultValueEv ## OZChannel::getDefaultValue() const
000000000005688f	cvtsd2ss	%xmm0, %xmm0
0000000000056893	movss	%xmm0, -0x24(%rbp)
0000000000056898	leaq	0x120(%r14), %rdi
000000000005689f	callq	__ZNK9OZChannel15getDefaultValueEv ## OZChannel::getDefaultValue() const
00000000000568a4	cvtsd2ss	%xmm0, %xmm0
00000000000568a8	movss	%xmm0, -0x20(%rbp)
00000000000568ad	leaq	0x1b8(%r14), %rdi
00000000000568b4	callq	__ZNK9OZChannel15getDefaultValueEv ## OZChannel::getDefaultValue() const
00000000000568b9	cvtsd2ss	%xmm0, %xmm0
00000000000568bd	movss	%xmm0, -0x1c(%rbp)
00000000000568c2	cmpb	$0x1, 0x3e8(%r14)
00000000000568ca	jne	0x568da
00000000000568cc	leaq	-0x18(%rbp), %rdi
00000000000568d0	movq	%r14, %rsi
00000000000568d3	callq	__ZNK21OZChannelColorNoAlpha15getPCColorSpaceEv ## OZChannelColorNoAlpha::getPCColorSpace() const
00000000000568d8	jmp	0x568e6
00000000000568da	leaq	-0x18(%rbp), %rdi
00000000000568de	movq	%rbx, %rsi
00000000000568e1	callq	0xacd5c                         ## symbol stub for: __ZNK7PCColor13getColorSpaceEv
00000000000568e6	movss	0x5a4ca(%rip), %xmm3
00000000000568ee	leaq	-0x18(%rbp), %rsi
00000000000568f2	movq	%rbx, %rdi
00000000000568f5	movss	-0x24(%rbp), %xmm0
00000000000568fa	movss	-0x20(%rbp), %xmm1
00000000000568ff	movss	-0x1c(%rbp), %xmm2
0000000000056904	callq	0xacc84                         ## symbol stub for: __ZN7PCColor7setRGBAEffffRK18PCColorSpaceHandle
0000000000056909	leaq	-0x18(%rbp), %rdi
000000000005690d	callq	__ZN7PCCFRefIP12CGColorSpaceED2Ev ## PCCFRef<CGColorSpace*>::~PCCFRef()
0000000000056912	addq	$0x20, %rsp
0000000000056916	popq	%rbx
0000000000056917	popq	%r14
0000000000056919	popq	%rbp
000000000005691a	retq
000000000005691b	movq	%rax, %rbx
000000000005691e	leaq	-0x18(%rbp), %rdi
0000000000056922	callq	__ZN7PCCFRefIP12CGColorSpaceED2Ev ## PCCFRef<CGColorSpace*>::~PCCFRef()
0000000000056927	movq	%rbx, %rdi
000000000005692a	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
000000000005692f	nop
