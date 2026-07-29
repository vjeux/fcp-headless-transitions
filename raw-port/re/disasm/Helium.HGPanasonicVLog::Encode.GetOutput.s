__ZN15HGPanasonicVLog6Encode9GetOutputEP10HGRenderer:
0000000000104660	pushq	%rbp
0000000000104661	movq	%rsp, %rbp
0000000000104664	pushq	%r14
0000000000104666	pushq	%rbx
0000000000104667	movq	%rdi, %rbx
000000000010466a	movq	0x198(%rdi), %r14
0000000000104671	movq	%rsi, %rdi
0000000000104674	movq	%rbx, %rsi
0000000000104677	xorl	%edx, %edx
0000000000104679	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
000000000010467e	movq	(%r14), %rcx
0000000000104681	movq	%r14, %rdi
0000000000104684	xorl	%esi, %esi
0000000000104686	movq	%rax, %rdx
0000000000104689	callq	*0x78(%rcx)
000000000010468c	movq	0x198(%rbx), %rdi
0000000000104693	movq	0x1a8(%rbx), %rsi
000000000010469a	movl	$0x1, %edx
000000000010469f	callq	__ZN13HGColorMatrix10LoadMatrixEPKDv4_fb ## HGColorMatrix::LoadMatrix(float vector[4] const*, bool)
00000000001046a4	movzbl	__ZGVZN15HGPanasonicVLog6Encode9GetOutputEP10HGRendererE1c(%rip), %eax ## guard variable for HGPanasonicVLog::Encode::GetOutput(HGRenderer*)::c
00000000001046ab	testb	%al, %al
00000000001046ad	je	0x10472d
00000000001046af	movq	0x198(%rbx), %rdx
00000000001046b6	movq	0x1a0(%rbx), %rdi
00000000001046bd	movq	(%rdi), %rax
00000000001046c0	xorl	%esi, %esi
00000000001046c2	callq	*0x78(%rax)
00000000001046c5	movq	0x1a0(%rbx), %rdi
00000000001046cc	movss	__ZZN15HGPanasonicVLog6Encode9GetOutputEP10HGRendererE1c(%rip), %xmm2 ## HGPanasonicVLog::Encode::GetOutput(HGRenderer*)::c
00000000001046d4	movq	(%rdi), %rax
00000000001046d7	movss	0x2cc90d(%rip), %xmm0
00000000001046df	movss	0x2cc959(%rip), %xmm1
00000000001046e7	movss	0x2cc955(%rip), %xmm3
00000000001046ef	xorl	%esi, %esi
00000000001046f1	callq	*0x60(%rax)
00000000001046f4	movq	0x1a0(%rbx), %rdi
00000000001046fb	movq	(%rdi), %rax
00000000001046fe	movss	0x2cc942(%rip), %xmm0
0000000000104706	movss	0x2c62c6(%rip), %xmm1
000000000010470e	movss	0x2cc936(%rip), %xmm2
0000000000104716	xorps	%xmm3, %xmm3
0000000000104719	movl	$0x1, %esi
000000000010471e	callq	*0x60(%rax)
0000000000104721	movq	0x1a0(%rbx), %rax
0000000000104728	popq	%rbx
0000000000104729	popq	%r14
000000000010472b	popq	%rbp
000000000010472c	retq
000000000010472d	callq	__ZN15HGPanasonicVLog6Encode9GetOutputEP10HGRenderer.cold.1 ## HGPanasonicVLog::Encode::GetOutput(HGRenderer*) (.cold.1)
0000000000104732	jmp	0x1046af
0000000000104737	nopw	(%rax,%rax)
