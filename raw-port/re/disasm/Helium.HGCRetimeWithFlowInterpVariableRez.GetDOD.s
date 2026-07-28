__ZN34HGCRetimeWithFlowInterpVariableRez6GetDODEP10HGRendereri6HGRect:
00000000000e1490	cmpl	$0x1, %edx
00000000000e1493	jbe	0xe14ed
00000000000e1495	cmpl	$0x2, %edx
00000000000e1498	jne	0xe14df
00000000000e149a	pushq	%rbp
00000000000e149b	movq	%rsp, %rbp
00000000000e149e	cvtsi2ss	%ecx, %xmm0
00000000000e14a2	divss	0x1a8(%rdi), %xmm0
00000000000e14aa	shrq	$0x20, %rcx
00000000000e14ae	cvtsi2ss	%ecx, %xmm1
00000000000e14b2	cvtsi2ss	%r8d, %xmm2
00000000000e14b7	movss	0x1ac(%rdi), %xmm4
00000000000e14bf	divss	%xmm4, %xmm1
00000000000e14c3	divss	%xmm4, %xmm2
00000000000e14c7	shrq	$0x20, %r8
00000000000e14cb	cvtsi2ss	%r8d, %xmm3
00000000000e14d0	divss	%xmm4, %xmm3
00000000000e14d4	callq	_HGRectfMake4f
00000000000e14d9	popq	%rbp
00000000000e14da	jmp	_HGRectIntegral
00000000000e14df	leaq	_HGRectNull(%rip), %rax
00000000000e14e6	movq	(%rax), %rcx
00000000000e14e9	movq	0x8(%rax), %r8
00000000000e14ed	movq	%rcx, %rax
00000000000e14f0	movq	%r8, %rdx
00000000000e14f3	retq
00000000000e14f4	nopw	%cs:(%rax,%rax)
