__ZN9OZFactory12setFileRefIDEj:
0000000000013630	pushq	%rbp
0000000000013631	movq	%rsp, %rbp
0000000000013634	pushq	%rbx
0000000000013635	pushq	%rax
0000000000013636	movl	%esi, %ebx
0000000000013638	callq	__ZN12_GLOBAL__N_127getThreadSpecificForFactoryEPK9OZFactory ## (anonymous namespace)::getThreadSpecificForFactory(OZFactory const*)
000000000001363d	movl	%ebx, 0x4(%rax)
0000000000013640	addq	$0x8, %rsp
0000000000013644	popq	%rbx
0000000000013645	popq	%rbp
0000000000013646	retq
0000000000013647	nop
