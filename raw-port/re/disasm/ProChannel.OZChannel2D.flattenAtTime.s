__ZN11OZChannel2D13flattenAtTimeERK6CMTime:
0000000000047e52	pushq	%rbp
0000000000047e53	movq	%rsp, %rbp
0000000000047e56	pushq	%r15
0000000000047e58	pushq	%r14
0000000000047e5a	pushq	%r12
0000000000047e5c	pushq	%rbx
0000000000047e5d	movq	%rsi, %r12
0000000000047e60	movq	%rdi, %rbx
0000000000047e63	leaq	0x88(%rdi), %r14
0000000000047e6a	movq	%r14, %rdi
0000000000047e6d	callq	__ZN9OZChannel11getKeyframeERK6CMTime ## OZChannel::getKeyframe(CMTime const&)
0000000000047e72	movq	%rax, %r15
0000000000047e75	addq	$0x120, %rbx                    ## imm = 0x120
0000000000047e7c	movq	%rbx, %rdi
0000000000047e7f	movq	%r12, %rsi
0000000000047e82	callq	__ZN9OZChannel11getKeyframeERK6CMTime ## OZChannel::getKeyframe(CMTime const&)
0000000000047e87	movq	%rax, %r12
0000000000047e8a	xorps	%xmm0, %xmm0
0000000000047e8d	xorps	%xmm1, %xmm1
0000000000047e90	movq	%r14, %rdi
0000000000047e93	movq	%r15, %rsi
0000000000047e96	movl	$0x1, %edx
0000000000047e9b	callq	__ZN9OZChannel25setKeyframeOutputTangentsEPvddb ## OZChannel::setKeyframeOutputTangents(void*, double, double, bool)
0000000000047ea0	xorps	%xmm0, %xmm0
0000000000047ea3	xorps	%xmm1, %xmm1
0000000000047ea6	movq	%r14, %rdi
0000000000047ea9	movq	%r15, %rsi
0000000000047eac	movl	$0x1, %edx
0000000000047eb1	callq	__ZN9OZChannel24setKeyframeInputTangentsEPvddb ## OZChannel::setKeyframeInputTangents(void*, double, double, bool)
0000000000047eb6	xorps	%xmm0, %xmm0
0000000000047eb9	xorps	%xmm1, %xmm1
0000000000047ebc	movq	%rbx, %rdi
0000000000047ebf	movq	%r12, %rsi
0000000000047ec2	movl	$0x1, %edx
0000000000047ec7	callq	__ZN9OZChannel25setKeyframeOutputTangentsEPvddb ## OZChannel::setKeyframeOutputTangents(void*, double, double, bool)
0000000000047ecc	xorps	%xmm0, %xmm0
0000000000047ecf	xorps	%xmm1, %xmm1
0000000000047ed2	movq	%rbx, %rdi
0000000000047ed5	movq	%r12, %rsi
0000000000047ed8	movl	$0x1, %edx
0000000000047edd	callq	__ZN9OZChannel24setKeyframeInputTangentsEPvddb ## OZChannel::setKeyframeInputTangents(void*, double, double, bool)
0000000000047ee2	movq	%r14, %rdi
0000000000047ee5	movq	%r15, %rsi
0000000000047ee8	xorl	%edx, %edx
0000000000047eea	callq	__ZN9OZChannel25setKeyframeTangentsBrokenEPvb ## OZChannel::setKeyframeTangentsBroken(void*, bool)
0000000000047eef	movq	%rbx, %rdi
0000000000047ef2	movq	%r12, %rsi
0000000000047ef5	xorl	%edx, %edx
0000000000047ef7	popq	%rbx
0000000000047ef8	popq	%r12
0000000000047efa	popq	%r14
0000000000047efc	popq	%r15
0000000000047efe	popq	%rbp
0000000000047eff	jmp	__ZN9OZChannel25setKeyframeTangentsBrokenEPvb ## OZChannel::setKeyframeTangentsBroken(void*, bool)
