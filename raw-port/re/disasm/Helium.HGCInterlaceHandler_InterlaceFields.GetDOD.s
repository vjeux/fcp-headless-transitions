__ZN35HGCInterlaceHandler_InterlaceFields6GetDODEP10HGRendereri6HGRect:
0000000000093440	pushq	%rbp
0000000000093441	movq	%rsp, %rbp
0000000000093444	subq	$0x10, %rsp
0000000000093448	leaq	_HGRectNull(%rip), %rax
000000000009344f	movups	(%rax), %xmm0
0000000000093452	movaps	%xmm0, -0x10(%rbp)
0000000000093456	cmpl	$0x1, %edx
0000000000093459	ja	0x93476
000000000009345b	movq	%rcx, -0x10(%rbp)
000000000009345f	movq	%r8, -0x8(%rbp)
0000000000093463	leaq	-0x10(%rbp), %rdi
0000000000093467	callq	__ZNK6HGRect10IsInfiniteEv      ## HGRect::IsInfinite() const
000000000009346c	testb	%al, %al
000000000009346e	jne	0x93476
0000000000093470	shll	-0xc(%rbp)
0000000000093473	shll	-0x4(%rbp)
0000000000093476	movq	-0x10(%rbp), %rax
000000000009347a	movq	-0x8(%rbp), %rdx
000000000009347e	addq	$0x10, %rsp
0000000000093482	popq	%rbp
0000000000093483	retq
0000000000093484	nopw	%cs:(%rax,%rax)
