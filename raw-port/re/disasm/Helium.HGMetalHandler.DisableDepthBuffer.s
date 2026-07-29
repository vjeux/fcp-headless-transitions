__ZN14HGMetalHandler18DisableDepthBufferEv:
000000000015dda0	pushq	%rbp
000000000015dda1	movq	%rsp, %rbp
000000000015dda4	pushq	%rbx
000000000015dda5	pushq	%rax
000000000015dda6	movq	%rdi, %rbx
000000000015dda9	movq	0x1d0(%rdi), %rdi
000000000015ddb0	testq	%rdi, %rdi
000000000015ddb3	je	0x15ddcd
000000000015ddb5	movq	(%rdi), %rax
000000000015ddb8	callq	*0x18(%rax)
000000000015ddbb	movq	$0x0, 0x1d0(%rbx)
000000000015ddc6	movb	$0x1, 0x708(%rbx)
000000000015ddcd	addq	$0x8, %rsp
000000000015ddd1	popq	%rbx
000000000015ddd2	popq	%rbp
000000000015ddd3	retq
000000000015ddd4	nopw	%cs:(%rax,%rax)
