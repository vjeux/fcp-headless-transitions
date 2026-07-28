__ZN13HGOutputClamp11Set_Cb_coefEffff:
00000000001ac970	pushq	%rbp
00000000001ac971	movq	%rsp, %rbp
00000000001ac974	pushq	%rbx
00000000001ac975	pushq	%rax
00000000001ac976	cmpl	$0x0, 0x198(%rdi)
00000000001ac97d	je	0x1ac998
00000000001ac97f	movq	0x1a0(%rdi), %rdi
00000000001ac986	movq	(%rdi), %rax
00000000001ac989	movl	$0x1, %ebx
00000000001ac98e	movl	$0x1, %esi
00000000001ac993	callq	*0x60(%rax)
00000000001ac996	jmp	0x1ac99d
00000000001ac998	movl	$0xffffffff, %ebx               ## imm = 0xFFFFFFFF
00000000001ac99d	movl	%ebx, %eax
00000000001ac99f	addq	$0x8, %rsp
00000000001ac9a3	popq	%rbx
00000000001ac9a4	popq	%rbp
00000000001ac9a5	retq
00000000001ac9a6	nopw	%cs:(%rax,%rax)
