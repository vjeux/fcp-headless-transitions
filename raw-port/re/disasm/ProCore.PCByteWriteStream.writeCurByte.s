__ZN17PCByteWriteStream12writeCurByteEv:
00000000000234da	pushq	%rbp
00000000000234db	movq	%rsp, %rbp
00000000000234de	pushq	%rbx
00000000000234df	pushq	%rax
00000000000234e0	movq	%rdi, %rbx
00000000000234e3	addq	$0x18, %rdi
00000000000234e7	leaq	0x8(%rbx), %rdx
00000000000234eb	movl	0x18(%rbx), %esi
00000000000234ee	callq	__ZN14PCDynamicArrayIhE6insertEjRKh ## PCDynamicArray<unsigned char>::insert(unsigned int, unsigned char const&)
00000000000234f3	movb	$0x0, 0x8(%rbx)
00000000000234f7	movl	$0x8, 0xc(%rbx)
00000000000234fe	addq	$0x8, %rsp
0000000000023502	popq	%rbx
0000000000023503	popq	%rbp
0000000000023504	retq
0000000000023505	nop
