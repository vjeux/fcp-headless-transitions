__ZN35HGCInterlaceHandler_InterlaceFields6GetROIEP10HGRendereri6HGRect:
0000000000093490	pushq	%rbp
0000000000093491	movq	%rsp, %rbp
0000000000093494	subq	$0x10, %rsp
0000000000093498	leaq	_HGRectNull(%rip), %rax
000000000009349f	movups	(%rax), %xmm0
00000000000934a2	movaps	%xmm0, -0x10(%rbp)
00000000000934a6	cmpl	$0x1, %edx
00000000000934a9	ja	0x934e0
00000000000934ab	movq	%rcx, -0x10(%rbp)
00000000000934af	movq	%r8, -0x8(%rbp)
00000000000934b3	leaq	-0x10(%rbp), %rdi
00000000000934b7	callq	__ZNK6HGRect10IsInfiniteEv      ## HGRect::IsInfinite() const
00000000000934bc	testb	%al, %al
00000000000934be	jne	0x934e0
00000000000934c0	movl	-0xc(%rbp), %eax
00000000000934c3	movl	-0x4(%rbp), %ecx
00000000000934c6	movl	%eax, %edx
00000000000934c8	shrl	$0x1f, %edx
00000000000934cb	addl	%eax, %edx
00000000000934cd	sarl	%edx
00000000000934cf	decl	%edx
00000000000934d1	movl	%edx, -0xc(%rbp)
00000000000934d4	movl	%ecx, %eax
00000000000934d6	shrl	$0x1f, %eax
00000000000934d9	addl	%ecx, %eax
00000000000934db	sarl	%eax
00000000000934dd	movl	%eax, -0x4(%rbp)
00000000000934e0	movq	-0x10(%rbp), %rax
00000000000934e4	movq	-0x8(%rbp), %rdx
00000000000934e8	addq	$0x10, %rsp
00000000000934ec	popq	%rbp
00000000000934ed	retq
00000000000934ee	addb	%al, (%rax)
