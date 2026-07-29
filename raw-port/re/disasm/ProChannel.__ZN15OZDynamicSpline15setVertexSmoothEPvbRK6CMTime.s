__ZN15OZDynamicSpline15setVertexSmoothEPvbRK6CMTime:
000000000002c398	testl	%edx, %edx
000000000002c39a	jne	0x2c3d1
000000000002c39c	pushq	%rbp
000000000002c39d	movq	%rsp, %rbp
000000000002c3a0	pushq	%r14
000000000002c3a2	pushq	%rbx
000000000002c3a3	movq	%rcx, %rbx
000000000002c3a6	movq	%rsi, %r14
000000000002c3a9	movq	(%rsi), %rax
000000000002c3ac	xorps	%xmm0, %xmm0
000000000002c3af	xorps	%xmm1, %xmm1
000000000002c3b2	movq	%rsi, %rdi
000000000002c3b5	movq	%rcx, %rsi
000000000002c3b8	callq	*0x48(%rax)
000000000002c3bb	movq	(%r14), %rax
000000000002c3be	xorps	%xmm0, %xmm0
000000000002c3c1	xorps	%xmm1, %xmm1
000000000002c3c4	movq	%r14, %rdi
000000000002c3c7	movq	%rbx, %rsi
000000000002c3ca	callq	*0x50(%rax)
000000000002c3cd	popq	%rbx
000000000002c3ce	popq	%r14
000000000002c3d0	popq	%rbp
000000000002c3d1	movb	$0x1, %al
000000000002c3d3	retq
