__ZN21OZChannelColorNoAlpha8setColorERK6CMTimeRK7PCColorb:
00000000000566b0	pushq	%rbp
00000000000566b1	movq	%rsp, %rbp
00000000000566b4	pushq	%r15
00000000000566b6	pushq	%r14
00000000000566b8	pushq	%r12
00000000000566ba	pushq	%rbx
00000000000566bb	subq	$0x20, %rsp
00000000000566bf	movl	%ecx, %r15d
00000000000566c2	movq	%rdx, %r12
00000000000566c5	movq	%rsi, %rbx
00000000000566c8	movq	%rdi, %r14
00000000000566cb	cmpb	$0x1, 0x3e8(%rdi)
00000000000566d2	jne	0x566e2
00000000000566d4	leaq	-0x28(%rbp), %rdi
00000000000566d8	movq	%r14, %rsi
00000000000566db	callq	__ZNK21OZChannelColorNoAlpha15getPCColorSpaceEv ## OZChannelColorNoAlpha::getPCColorSpace() const
00000000000566e0	jmp	0x566ee
00000000000566e2	leaq	-0x28(%rbp), %rdi
00000000000566e6	movq	%r12, %rsi
00000000000566e9	callq	0xacd5c                         ## symbol stub for: __ZNK7PCColor13getColorSpaceEv
00000000000566ee	leaq	-0x34(%rbp), %rsi
00000000000566f2	leaq	-0x30(%rbp), %rdx
00000000000566f6	leaq	-0x2c(%rbp), %rcx
00000000000566fa	leaq	-0x28(%rbp), %r8
00000000000566fe	movq	%r12, %rdi
0000000000056701	callq	0xacd68                         ## symbol stub for: __ZNK7PCColor6getRGBEPfS0_S0_RK18PCColorSpaceHandle
0000000000056706	leaq	-0x28(%rbp), %rdi
000000000005670a	callq	__ZN7PCCFRefIP12CGColorSpaceED2Ev ## PCCFRef<CGColorSpace*>::~PCCFRef()
000000000005670f	cvtss2sd	-0x34(%rbp), %xmm0
0000000000056714	leaq	0x88(%r14), %rdi
000000000005671b	movq	0x88(%r14), %rax
0000000000056722	movzbl	%r15b, %r15d
0000000000056726	movq	%rbx, %rsi
0000000000056729	movl	%r15d, %edx
000000000005672c	callq	*0x2c8(%rax)
0000000000056732	xorps	%xmm0, %xmm0
0000000000056735	cvtss2sd	-0x30(%rbp), %xmm0
000000000005673a	leaq	0x120(%r14), %rdi
0000000000056741	movq	0x120(%r14), %rax
0000000000056748	movq	%rbx, %rsi
000000000005674b	movl	%r15d, %edx
000000000005674e	callq	*0x2c8(%rax)
0000000000056754	xorps	%xmm0, %xmm0
0000000000056757	cvtss2sd	-0x2c(%rbp), %xmm0
000000000005675c	movq	0x1b8(%r14), %rax
0000000000056763	addq	$0x1b8, %r14                    ## imm = 0x1B8
000000000005676a	movq	%r14, %rdi
000000000005676d	movq	%rbx, %rsi
0000000000056770	movl	%r15d, %edx
0000000000056773	callq	*0x2c8(%rax)
0000000000056779	addq	$0x20, %rsp
000000000005677d	popq	%rbx
000000000005677e	popq	%r12
0000000000056780	popq	%r14
0000000000056782	popq	%r15
0000000000056784	popq	%rbp
0000000000056785	retq
0000000000056786	movq	%rax, %rbx
0000000000056789	leaq	-0x28(%rbp), %rdi
000000000005678d	callq	__ZN7PCCFRefIP12CGColorSpaceED2Ev ## PCCFRef<CGColorSpace*>::~PCCFRef()
0000000000056792	movq	%rbx, %rdi
0000000000056795	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
