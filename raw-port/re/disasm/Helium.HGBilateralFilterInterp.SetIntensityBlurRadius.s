__ZN23HGBilateralFilterInterp22SetIntensityBlurRadiusEf:
0000000000109250	pushq	%rbp
0000000000109251	movq	%rsp, %rbp
0000000000109254	pushq	%rbx
0000000000109255	pushq	%rax
0000000000109256	movss	%xmm0, -0xc(%rbp)
000000000010925b	movq	%rdi, %rbx
000000000010925e	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
0000000000109263	movss	-0xc(%rbp), %xmm0
0000000000109268	movss	%xmm0, 0x1d0(%rbx)
0000000000109270	addq	$0x8, %rsp
0000000000109274	popq	%rbx
0000000000109275	popq	%rbp
0000000000109276	retq
0000000000109277	nopw	(%rax,%rax)
