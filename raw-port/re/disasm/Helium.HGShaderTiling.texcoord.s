__ZNK14HGShaderTiling8texcoordEjbiijjPf:
00000000000c7a80	pushq	%rbp
00000000000c7a81	movq	%rsp, %rbp
00000000000c7a84	pushq	%rbx
00000000000c7a85	movl	0x38(%rdi), %ebx
00000000000c7a88	testl	%edx, %edx
00000000000c7a8a	jne	0xc7a94
00000000000c7a8c	cmpl	0x48(%rdi), %ebx
00000000000c7a8f	jae	0xc7a94
00000000000c7a91	addl	0x4c(%rdi), %ebx
00000000000c7a94	movq	0x18(%rbp), %r11
00000000000c7a98	movl	0x34(%rdi), %r10d
00000000000c7a9c	btl	%esi, %r10d
00000000000c7aa0	jae	0xc7ac3
00000000000c7aa2	cvtsi2ss	%ecx, %xmm0
00000000000c7aa6	cvtsi2ss	%r8d, %xmm1
00000000000c7aab	movss	%xmm0, (%r11)
00000000000c7ab0	movss	%xmm1, 0x4(%r11)
00000000000c7ab6	movq	$0x0, 0x8(%r11)
00000000000c7abe	movl	%esi, %eax
00000000000c7ac0	popq	%rbx
00000000000c7ac1	popq	%rbp
00000000000c7ac2	retq
00000000000c7ac3	movl	%esi, %eax
00000000000c7ac5	subl	%ebx, %eax
00000000000c7ac7	jb	0xc7b60
00000000000c7acd	cmpl	0x3c(%rdi), %esi
00000000000c7ad0	jae	0xc7b60
00000000000c7ad6	xorl	%edi, %edi
00000000000c7ad8	movl	%r10d, %edx
00000000000c7adb	movl	%r10d, %ecx
00000000000c7ade	nop
00000000000c7ae0	movl	%edx, %r8d
00000000000c7ae3	andl	$0x1, %r8d
00000000000c7ae7	addl	%r8d, %edi
00000000000c7aea	shrl	%ecx
00000000000c7aec	cmpl	$0x1, %edx
00000000000c7aef	movl	%ecx, %edx
00000000000c7af1	ja	0xc7ae0
00000000000c7af3	addl	%edi, %eax
00000000000c7af5	xorl	%edx, %edx
00000000000c7af7	divl	%edi
00000000000c7af9	movl	%eax, %ecx
00000000000c7afb	xorl	%edx, %edx
00000000000c7afd	divl	%r9d
00000000000c7b00	movl	%edx, %r8d
00000000000c7b03	notl	%r8d
00000000000c7b06	addl	%r9d, %r8d
00000000000c7b09	testb	$0x1, %al
00000000000c7b0b	cmovel	%edx, %r8d
00000000000c7b0f	cvtsi2ss	%r8, %xmm0
00000000000c7b14	cvtsi2ss	%rax, %xmm1
00000000000c7b19	movss	%xmm0, (%r11)
00000000000c7b1e	movss	%xmm1, 0x4(%r11)
00000000000c7b24	movq	$0x0, 0x8(%r11)
00000000000c7b2c	addl	%edi, %esi
00000000000c7b2e	subl	%ecx, %esi
00000000000c7b30	movl	%esi, %eax
00000000000c7b32	xorl	%edx, %edx
00000000000c7b34	divl	%edi
00000000000c7b36	movl	$0x0, %esi
00000000000c7b3b	testl	%edx, %edx
00000000000c7b3d	je	0xc7abe
00000000000c7b43	movl	$0xffffffff, %esi               ## imm = 0xFFFFFFFF
00000000000c7b48	nopl	(%rax,%rax)
00000000000c7b50	incl	%esi
00000000000c7b52	btl	%esi, %r10d
00000000000c7b56	sbbl	$0x0, %edx
00000000000c7b59	jne	0xc7b50
00000000000c7b5b	jmp	0xc7abe
00000000000c7b60	xorps	%xmm0, %xmm0
00000000000c7b63	movups	%xmm0, (%r11)
00000000000c7b67	movl	%esi, %eax
00000000000c7b69	popq	%rbx
00000000000c7b6a	popq	%rbp
00000000000c7b6b	retq
00000000000c7b6c	nopl	(%rax)
