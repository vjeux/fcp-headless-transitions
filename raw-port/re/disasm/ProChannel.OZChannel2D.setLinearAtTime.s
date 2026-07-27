__ZN11OZChannel2D15setLinearAtTimeERK6CMTime:
0000000000047f04	pushq	%rbp
0000000000047f05	movq	%rsp, %rbp
0000000000047f08	pushq	%r15
0000000000047f0a	pushq	%r14
0000000000047f0c	pushq	%r12
0000000000047f0e	pushq	%rbx
0000000000047f0f	movq	%rsi, %rbx
0000000000047f12	movq	%rdi, %r14
0000000000047f15	leaq	0x88(%rdi), %r15
0000000000047f1c	movq	%r15, %rdi
0000000000047f1f	callq	__ZN9OZChannel11getKeyframeERK6CMTime ## OZChannel::getKeyframe(CMTime const&)
0000000000047f24	movq	%rax, %r12
0000000000047f27	addq	$0x120, %r14                    ## imm = 0x120
0000000000047f2e	movq	%r14, %rdi
0000000000047f31	movq	%rbx, %rsi
0000000000047f34	callq	__ZN9OZChannel11getKeyframeERK6CMTime ## OZChannel::getKeyframe(CMTime const&)
0000000000047f39	movq	%rax, %rbx
0000000000047f3c	movq	%r15, %rdi
0000000000047f3f	movq	%r12, %rsi
0000000000047f42	movl	$0x1, %edx
0000000000047f47	callq	__ZN9OZChannel24setKeyframeInterpolationEPvj ## OZChannel::setKeyframeInterpolation(void*, unsigned int)
0000000000047f4c	movq	%r14, %rdi
0000000000047f4f	movq	%rbx, %rsi
0000000000047f52	movl	$0x1, %edx
0000000000047f57	popq	%rbx
0000000000047f58	popq	%r12
0000000000047f5a	popq	%r14
0000000000047f5c	popq	%r15
0000000000047f5e	popq	%rbp
0000000000047f5f	jmp	__ZN9OZChannel24setKeyframeInterpolationEPvj ## OZChannel::setKeyframeInterpolation(void*, unsigned int)
