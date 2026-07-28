__ZN23HGBilateralFilterInterp20SetSpatialBlurRadiusEf:
0000000000109220	pushq	%rbp
0000000000109221	movq	%rsp, %rbp
0000000000109224	pushq	%rbx
0000000000109225	pushq	%rax
0000000000109226	movss	%xmm0, -0xc(%rbp)
000000000010922b	movq	%rdi, %rbx
000000000010922e	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
0000000000109233	movss	-0xc(%rbp), %xmm0
0000000000109238	movss	%xmm0, 0x1cc(%rbx)
0000000000109240	addq	$0x8, %rsp
0000000000109244	popq	%rbx
0000000000109245	popq	%rbp
0000000000109246	retq
0000000000109247	nopw	(%rax,%rax)
