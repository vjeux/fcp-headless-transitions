__ZN7PCBlend12maskModeNameE11PCBlendMode:
0000000000017dc1	pushq	%rbp
0000000000017dc2	movq	%rsp, %rbp
0000000000017dc5	pushq	%rbx
0000000000017dc6	pushq	%rax
0000000000017dc7	movl	%edi, %ebx
0000000000017dc9	callq	__ZN7PCBlendL21getMaskModeNameVectorEv ## PCBlend::getMaskModeNameVector()
0000000000017dce	movq	__ZZN7PCBlendL21getMaskModeNameVectorEvE18maskModeNameVector(%rip), %rax ## PCBlend::getMaskModeNameVector()::maskModeNameVector
0000000000017dd5	cmpq	%rax, 0x14353c(%rip)
0000000000017ddc	jne	0x17dea
0000000000017dde	callq	__ZN7PCBlendL28initializeMaskModeNameVectorEv ## PCBlend::initializeMaskModeNameVector()
0000000000017de3	movq	__ZZN7PCBlendL21getMaskModeNameVectorEvE18maskModeNameVector(%rip), %rax ## PCBlend::getMaskModeNameVector()::maskModeNameVector
0000000000017dea	movl	%ebx, %ecx
0000000000017dec	leaq	(%rax,%rcx,8), %rax
0000000000017df0	addq	$0x8, %rsp
0000000000017df4	popq	%rbx
0000000000017df5	popq	%rbp
0000000000017df6	retq
