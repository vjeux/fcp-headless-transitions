__ZN9VlcParser2seEv:
00000000014215a0	pushq	%rbp
00000000014215a1	movq	%rsp, %rbp
00000000014215a4	pushq	%rbx
00000000014215a5	pushq	%rax
00000000014215a6	movl	(%rdi), %ebx
00000000014215a8	movl	%ebx, -0xc(%rbp)
00000000014215ab	bsrl	-0xc(%rbp), %ecx
00000000014215af	addl	%ecx, %ecx
00000000014215b1	xorl	$0x3e, %ecx
00000000014215b4	leal	0x1(%rcx), %esi
00000000014215b7	notb	%cl
00000000014215b9	shrl	%cl, %ebx
00000000014215bb	callq	__ZN15BitstreamReader9flushBitsEi ## BitstreamReader::flushBits(int)
00000000014215c0	movl	%ebx, %ecx
00000000014215c2	andl	$0x1, %ecx
00000000014215c5	shrl	%ebx
00000000014215c7	movl	%ecx, %eax
00000000014215c9	negl	%eax
00000000014215cb	xorl	%ebx, %eax
00000000014215cd	addl	%ecx, %eax
00000000014215cf	addq	$0x8, %rsp
00000000014215d3	popq	%rbx
00000000014215d4	popq	%rbp
00000000014215d5	retq
00000000014215d6	nopw	%cs:(%rax,%rax)
