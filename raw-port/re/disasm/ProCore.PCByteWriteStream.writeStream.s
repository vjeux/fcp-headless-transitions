__ZN17PCByteWriteStream11writeStreamERS_:
0000000000023506	pushq	%rbp
0000000000023507	movq	%rsp, %rbp
000000000002350a	pushq	%r14
000000000002350c	pushq	%rbx
000000000002350d	movq	%rsi, %rbx
0000000000023510	movq	%rdi, %r14
0000000000023513	movq	(%rdi), %rax
0000000000023516	callq	*0x38(%rax)
0000000000023519	movq	0x20(%rbx), %rdx
000000000002351d	movl	0x18(%rbx), %ecx
0000000000023520	movl	0x18(%r14), %esi
0000000000023524	addq	$0x18, %r14
0000000000023528	movq	%r14, %rdi
000000000002352b	popq	%rbx
000000000002352c	popq	%r14
000000000002352e	popq	%rbp
000000000002352f	jmp	__ZN14PCDynamicArrayIhE6insertEjPKhj ## PCDynamicArray<unsigned char>::insert(unsigned int, unsigned char const*, unsigned int)
