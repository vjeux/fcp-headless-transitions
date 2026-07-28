__ZN12HMaskCompAdd6GetROIEP10HGRendereri6HGRect:
0000000000436b90	movq	%rcx, %rax
0000000000436b93	cmpl	$0x2, %edx
0000000000436b96	jl	0x436bab
0000000000436b98	pushq	%rbp
0000000000436b99	movq	%rsp, %rbp
0000000000436b9c	movq	0x3ea17d(%rip), %rcx            ## literal pool symbol address: _HGRectNull
0000000000436ba3	movq	(%rcx), %rax
0000000000436ba6	movq	0x8(%rcx), %r8
0000000000436baa	popq	%rbp
0000000000436bab	movq	%r8, %rdx
0000000000436bae	retq
0000000000436baf	nop
