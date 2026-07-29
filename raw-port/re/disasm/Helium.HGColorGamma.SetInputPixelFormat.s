__ZN12HGColorGamma19SetInputPixelFormatE13HGYCbCrFormat:
00000000000fb3b0	pushq	%rbp
00000000000fb3b1	movq	%rsp, %rbp
00000000000fb3b4	pushq	%r14
00000000000fb3b6	pushq	%rbx
00000000000fb3b7	movl	%esi, %ebx
00000000000fb3b9	movq	%rdi, %r14
00000000000fb3bc	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000000fb3c1	movb	$0x1, 0x2e9(%r14)
00000000000fb3c9	movl	%ebx, 0x424(%r14)
00000000000fb3d0	movq	%r14, %rdi
00000000000fb3d3	popq	%rbx
00000000000fb3d4	popq	%r14
00000000000fb3d6	popq	%rbp
00000000000fb3d7	jmp	__ZN12HGColorGamma20SetYCbCrBiasAndScaleEv ## HGColorGamma::SetYCbCrBiasAndScale()
00000000000fb3dc	nopl	(%rax)
