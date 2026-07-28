__ZN32HGCInterlaceHandler_ExtractField6GetDODEP10HGRendereri6HGRect:
0000000000093360	pushq	%rbp
0000000000093361	movq	%rsp, %rbp
0000000000093364	subq	$0x10, %rsp
0000000000093368	leaq	_HGRectNull(%rip), %rax
000000000009336f	movups	(%rax), %xmm0
0000000000093372	movaps	%xmm0, -0x10(%rbp)
0000000000093376	testl	%edx, %edx
0000000000093378	jne	0x933ad
000000000009337a	movq	%rcx, -0x10(%rbp)
000000000009337e	movq	%r8, -0x8(%rbp)
0000000000093382	leaq	-0x10(%rbp), %rdi
0000000000093386	callq	__ZNK6HGRect10IsInfiniteEv      ## HGRect::IsInfinite() const
000000000009338b	testb	%al, %al
000000000009338d	jne	0x933ad
000000000009338f	movl	-0xc(%rbp), %eax
0000000000093392	movl	-0x4(%rbp), %ecx
0000000000093395	movl	%eax, %edx
0000000000093397	shrl	$0x1f, %edx
000000000009339a	addl	%eax, %edx
000000000009339c	sarl	%edx
000000000009339e	movl	%edx, -0xc(%rbp)
00000000000933a1	movl	%ecx, %eax
00000000000933a3	shrl	$0x1f, %eax
00000000000933a6	addl	%ecx, %eax
00000000000933a8	sarl	%eax
00000000000933aa	movl	%eax, -0x4(%rbp)
00000000000933ad	movq	-0x10(%rbp), %rax
00000000000933b1	movq	-0x8(%rbp), %rdx
00000000000933b5	addq	$0x10, %rsp
00000000000933b9	popq	%rbp
00000000000933ba	retq
00000000000933bb	nopl	(%rax,%rax)
