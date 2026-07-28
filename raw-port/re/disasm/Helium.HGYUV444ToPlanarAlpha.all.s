__ZN21HGYUV444ToPlanarAlphaC2Ev:
00000000000e6690	pushq	%rbp
00000000000e6691	movq	%rsp, %rbp
00000000000e6694	pushq	%rbx
00000000000e6695	pushq	%rax
00000000000e6696	movq	%rdi, %rbx
00000000000e6699	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
00000000000e669e	leaq	0x928433(%rip), %rax
00000000000e66a5	movq	%rax, (%rbx)
00000000000e66a8	movq	$0x0, 0x198(%rbx)
00000000000e66b3	addq	$0x8, %rsp
00000000000e66b7	popq	%rbx
00000000000e66b8	popq	%rbp
00000000000e66b9	retq
00000000000e66ba	nopw	(%rax,%rax)
__ZN21HGYUV444ToPlanarAlphaC1Ev:
00000000000e66c0	pushq	%rbp
00000000000e66c1	movq	%rsp, %rbp
00000000000e66c4	pushq	%rbx
00000000000e66c5	pushq	%rax
00000000000e66c6	movq	%rdi, %rbx
00000000000e66c9	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
00000000000e66ce	leaq	0x928403(%rip), %rax
00000000000e66d5	movq	%rax, (%rbx)
00000000000e66d8	movq	$0x0, 0x198(%rbx)
00000000000e66e3	addq	$0x8, %rsp
00000000000e66e7	popq	%rbx
00000000000e66e8	popq	%rbp
00000000000e66e9	retq
00000000000e66ea	nopw	(%rax,%rax)
__ZN21HGYUV444ToPlanarAlphaD2Ev:
00000000000e66f0	pushq	%rbp
00000000000e66f1	movq	%rsp, %rbp
00000000000e66f4	pushq	%rbx
00000000000e66f5	pushq	%rax
00000000000e66f6	leaq	0x9283db(%rip), %rax
00000000000e66fd	movq	%rax, (%rdi)
00000000000e6700	movq	0x198(%rdi), %rax
00000000000e6707	testq	%rax, %rax
00000000000e670a	je	0xe671b
00000000000e670c	movq	(%rax), %rcx
00000000000e670f	movq	%rdi, %rbx
00000000000e6712	movq	%rax, %rdi
00000000000e6715	callq	*0x18(%rcx)
00000000000e6718	movq	%rbx, %rdi
00000000000e671b	addq	$0x8, %rsp
00000000000e671f	popq	%rbx
00000000000e6720	popq	%rbp
00000000000e6721	jmp	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000000e6726	movq	%rax, %rdi
00000000000e6729	callq	___clang_call_terminate
00000000000e672e	nop
__ZN21HGYUV444ToPlanarAlphaD1Ev:
00000000000e6730	pushq	%rbp
00000000000e6731	movq	%rsp, %rbp
00000000000e6734	pushq	%rbx
00000000000e6735	pushq	%rax
00000000000e6736	leaq	0x92839b(%rip), %rax
00000000000e673d	movq	%rax, (%rdi)
00000000000e6740	movq	0x198(%rdi), %rax
00000000000e6747	testq	%rax, %rax
00000000000e674a	je	0xe675b
00000000000e674c	movq	(%rax), %rcx
00000000000e674f	movq	%rdi, %rbx
00000000000e6752	movq	%rax, %rdi
00000000000e6755	callq	*0x18(%rcx)
00000000000e6758	movq	%rbx, %rdi
00000000000e675b	addq	$0x8, %rsp
00000000000e675f	popq	%rbx
00000000000e6760	popq	%rbp
00000000000e6761	jmp	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000000e6766	movq	%rax, %rdi
00000000000e6769	callq	___clang_call_terminate
00000000000e676e	nop
__ZN21HGYUV444ToPlanarAlphaD0Ev:
00000000000e6770	pushq	%rbp
00000000000e6771	movq	%rsp, %rbp
00000000000e6774	pushq	%rbx
00000000000e6775	pushq	%rax
00000000000e6776	movq	%rdi, %rbx
00000000000e6779	leaq	0x928358(%rip), %rax
00000000000e6780	movq	%rax, (%rdi)
00000000000e6783	movq	0x198(%rdi), %rdi
00000000000e678a	testq	%rdi, %rdi
00000000000e678d	je	0xe6795
00000000000e678f	movq	(%rdi), %rax
00000000000e6792	callq	*0x18(%rax)
00000000000e6795	movq	%rbx, %rdi
00000000000e6798	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000000e679d	movq	%rbx, %rdi
00000000000e67a0	addq	$0x8, %rsp
00000000000e67a4	popq	%rbx
00000000000e67a5	popq	%rbp
00000000000e67a6	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000000e67ab	movq	%rax, %rdi
00000000000e67ae	callq	___clang_call_terminate
00000000000e67b3	nopw	%cs:(%rax,%rax)
__ZN21HGYUV444ToPlanarAlpha9GetOutputEP10HGRenderer:
00000000000e67c0	pushq	%rbp
00000000000e67c1	movq	%rsp, %rbp
00000000000e67c4	pushq	%r15
00000000000e67c6	pushq	%r14
00000000000e67c8	pushq	%r12
00000000000e67ca	pushq	%rbx
00000000000e67cb	movq	%rsi, %r14
00000000000e67ce	movq	%rdi, %rbx
00000000000e67d1	movl	$0x200, %edi                    ## imm = 0x200
00000000000e67d6	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000e67db	movq	%rax, %r15
00000000000e67de	movq	%rax, %rdi
00000000000e67e1	callq	__ZN24HgcYUV420TriPlanar_alphaC1Ev ## HgcYUV420TriPlanar_alpha::HgcYUV420TriPlanar_alpha()
00000000000e67e6	movq	0x198(%rbx), %r12
00000000000e67ed	cmpq	%r15, %r12
00000000000e67f0	je	0xe680d
00000000000e67f2	testq	%r12, %r12
00000000000e67f5	je	0xe6801
00000000000e67f7	movq	(%r12), %rax
00000000000e67fb	movq	%r12, %rdi
00000000000e67fe	callq	*0x18(%rax)
00000000000e6801	movq	%r15, 0x198(%rbx)
00000000000e6808	movq	%r15, %r12
00000000000e680b	jmp	0xe6822
00000000000e680d	testq	%r15, %r15
00000000000e6810	je	0xe6822
00000000000e6812	movq	(%r15), %rax
00000000000e6815	movq	%r15, %rdi
00000000000e6818	callq	*0x18(%rax)
00000000000e681b	movq	0x198(%rbx), %r12
00000000000e6822	movq	%r14, %rdi
00000000000e6825	movq	%rbx, %rsi
00000000000e6828	xorl	%edx, %edx
00000000000e682a	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
00000000000e682f	movq	(%r12), %rcx
00000000000e6833	movq	%r12, %rdi
00000000000e6836	xorl	%esi, %esi
00000000000e6838	movq	%rax, %rdx
00000000000e683b	callq	*0x78(%rcx)
00000000000e683e	movq	0x198(%rbx), %rax
00000000000e6845	popq	%rbx
00000000000e6846	popq	%r12
00000000000e6848	popq	%r14
00000000000e684a	popq	%r15
00000000000e684c	popq	%rbp
