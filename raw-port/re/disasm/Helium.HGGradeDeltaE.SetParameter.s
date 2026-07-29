__ZN13HGGradeDeltaE12SetParameterEiffff:
00000000000da390	pushq	%rbp
00000000000da391	movq	%rsp, %rbp
00000000000da394	cmpl	$0x1, %esi
00000000000da397	je	0xda3bc
00000000000da399	movl	$0xffffffff, %eax               ## imm = 0xFFFFFFFF
00000000000da39e	testl	%esi, %esi
00000000000da3a0	jne	0xda3d8
00000000000da3a2	cvttss2si	%xmm0, %rcx
00000000000da3a7	cmpl	$0x2, %ecx
00000000000da3aa	ja	0xda3d8
00000000000da3ac	cmpl	%ecx, 0x19c(%rdi)
00000000000da3b2	je	0xda3da
00000000000da3b4	movl	%ecx, 0x19c(%rdi)
00000000000da3ba	jmp	0xda3d3
00000000000da3bc	movss	0x198(%rdi), %xmm1
00000000000da3c4	ucomiss	%xmm0, %xmm1
00000000000da3c7	jne	0xda3cb
00000000000da3c9	jnp	0xda3da
00000000000da3cb	movss	%xmm0, 0x198(%rdi)
00000000000da3d3	movl	$0x1, %eax
00000000000da3d8	popq	%rbp
00000000000da3d9	retq
00000000000da3da	xorl	%eax, %eax
00000000000da3dc	popq	%rbp
00000000000da3dd	retq
00000000000da3de	nop
