__ZN9HGACEScct6Decode9GetOutputEP10HGRenderer:
0000000000101d50	pushq	%rbp
0000000000101d51	movq	%rsp, %rbp
0000000000101d54	pushq	%r14
0000000000101d56	pushq	%rbx
0000000000101d57	movq	%rdi, %rbx
0000000000101d5a	movq	0x198(%rdi), %r14
0000000000101d61	movq	%rsi, %rdi
0000000000101d64	movq	%rbx, %rsi
0000000000101d67	xorl	%edx, %edx
0000000000101d69	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
0000000000101d6e	movq	(%r14), %rcx
0000000000101d71	movq	%r14, %rdi
0000000000101d74	xorl	%esi, %esi
0000000000101d76	movq	%rax, %rdx
0000000000101d79	callq	*0x78(%rcx)
0000000000101d7c	movq	0x198(%rbx), %rdi
0000000000101d83	movss	0x1a0(%rbx), %xmm3
0000000000101d8b	movq	(%rdi), %rax
0000000000101d8e	movss	0x2c5f2a(%rip), %xmm0
0000000000101d96	movss	0x2cf212(%rip), %xmm2
0000000000101d9e	xorps	%xmm1, %xmm1
0000000000101da1	xorl	%esi, %esi
0000000000101da3	callq	*0x60(%rax)
0000000000101da6	movq	0x198(%rbx), %rdi
0000000000101dad	movss	0x1a4(%rbx), %xmm0
0000000000101db5	movss	0x1a8(%rbx), %xmm1
0000000000101dbd	movq	(%rdi), %rax
0000000000101dc0	movss	0x2cf1ec(%rip), %xmm2
0000000000101dc8	xorps	%xmm3, %xmm3
0000000000101dcb	movl	$0x1, %esi
0000000000101dd0	callq	*0x60(%rax)
0000000000101dd3	movq	0x198(%rbx), %rax
0000000000101dda	popq	%rbx
0000000000101ddb	popq	%r14
0000000000101ddd	popq	%rbp
0000000000101dde	retq
0000000000101ddf	nop
__ZN18HGHybridQTGammaLog6EncodeC2ENS_11CurveParamsE:
0000000000101de0	pushq	%rbp
0000000000101de1	movq	%rsp, %rbp
0000000000101de4	pushq	%r15
0000000000101de6	pushq	%r14
0000000000101de8	pushq	%rbx
0000000000101de9	pushq	%rax
0000000000101dea	movl	%esi, %r14d
0000000000101ded	movq	%rdi, %rbx
0000000000101df0	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
0000000000101df5	leaq	0x916304(%rip), %rax
0000000000101dfc	movq	%rax, (%rbx)
0000000000101dff	movl	$0x1a0, %edi                    ## imm = 0x1A0
0000000000101e04	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000101e09	movq	%rax, %r15
0000000000101e0c	movq	%rax, %rdi
0000000000101e0f	callq	__ZN26HgcHybridQTGammaLog_encodeC1Ev ## HgcHybridQTGammaLog_encode::HgcHybridQTGammaLog_encode()
0000000000101e14	movq	%r15, 0x198(%rbx)
0000000000101e1b	movl	%r14d, %eax
0000000000101e1e	shlq	$0x5, %rax
0000000000101e22	leaq	__ZN18HGHybridQTGammaLog10calcParamsE(%rip), %rcx ## HGHybridQTGammaLog::calcParams
0000000000101e29	movsd	0x8(%rax,%rcx), %xmm0
0000000000101e2f	mulsd	0x2cf001(%rip), %xmm0
0000000000101e37	movsd	(%rax,%rcx), %xmm1
0000000000101e3c	unpcklpd	%xmm0, %xmm1                    ## xmm1 = xmm1[0],xmm0[0]
0000000000101e40	cvtpd2ps	0x10(%rax,%rcx), %xmm0
0000000000101e46	cvtpd2ps	%xmm1, %xmm1
0000000000101e4a	unpcklpd	%xmm0, %xmm1                    ## xmm1 = xmm1[0],xmm0[0]
0000000000101e4e	movapd	%xmm1, 0x1a0(%rbx)
