__ZNK15HGDitherLUTInfo9duplicateEv:
000000000006fef0	pushq	%rbp
000000000006fef1	movq	%rsp, %rbp
000000000006fef4	pushq	%rbx
000000000006fef5	pushq	%rax
000000000006fef6	movq	%rdi, %rbx
000000000006fef9	movl	$0x10, %edi
000000000006fefe	callq	0x3c4fb2                        ## symbol stub for: __Znwm
000000000006ff03	movl	0x8(%rbx), %ecx
000000000006ff06	leaq	0x998cc3(%rip), %rdx
000000000006ff0d	movq	%rdx, (%rax)
000000000006ff10	movl	%ecx, 0x8(%rax)
000000000006ff13	addq	$0x8, %rsp
000000000006ff17	popq	%rbx
000000000006ff18	popq	%rbp
000000000006ff19	retq
000000000006ff1a	nopw	(%rax,%rax)
