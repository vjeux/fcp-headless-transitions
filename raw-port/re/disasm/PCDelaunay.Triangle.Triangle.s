__ZN10PCDelaunay8TriangleC2Ev:
0000000000054762	pushq	%rbp
0000000000054763	movq	%rsp, %rbp
0000000000054766	pushq	%rbx
0000000000054767	pushq	%rax
0000000000054768	movq	%rdi, %rbx
000000000005476b	movl	$0x20, %eax
0000000000054770	movq	$0x0, -0x8(%rbx,%rax)
0000000000054779	movl	$0x0, (%rbx,%rax)
0000000000054780	addq	$0x10, %rax
0000000000054784	cmpq	$0x50, %rax
0000000000054788	jne	0x54770
000000000005478a	movl	$0x18, %esi
000000000005478f	movq	%rbx, %rdi
0000000000054792	callq	0xde79e                         ## symbol stub for: _bzero
0000000000054797	movw	$0x0, 0x48(%rbx)
000000000005479d	movb	$0x0, 0x4a(%rbx)
00000000000547a1	movl	__ZN10PCDelaunay8Triangle12_idGeneratorE(%rip), %eax ## PCDelaunay::Triangle::_idGenerator
00000000000547a7	incl	%eax
00000000000547a9	movl	%eax, __ZN10PCDelaunay8Triangle12_idGeneratorE(%rip) ## PCDelaunay::Triangle::_idGenerator
00000000000547af	movl	%eax, 0x4c(%rbx)
00000000000547b2	addq	$0x8, %rsp
00000000000547b6	popq	%rbx
00000000000547b7	popq	%rbp
00000000000547b8	retq
00000000000547b9	nop
