__ZN34HGFujifilmFLogLinearizationLUTInfoC1EmffN16HGApplyNDLUTInfo16LUTStorageFormatE:
0000000000114d80	pushq	%rbp
0000000000114d81	movq	%rsp, %rbp
0000000000114d84	pushq	%rbx
0000000000114d85	pushq	%rax
0000000000114d86	movl	%edx, %ecx
0000000000114d88	movq	%rdi, %rbx
0000000000114d8b	movl	$0x1, %edx
0000000000114d90	callq	__ZN16HGApplyNDLUTInfoC2EmmffNS_16LUTStorageFormatE ## HGApplyNDLUTInfo::HGApplyNDLUTInfo(unsigned long, unsigned long, float, float, HGApplyNDLUTInfo::LUTStorageFormat)
0000000000114d95	leaq	0x90821c(%rip), %rax
0000000000114d9c	movq	%rax, (%rbx)
0000000000114d9f	addq	$0x8, %rsp
0000000000114da3	popq	%rbx
0000000000114da4	popq	%rbp
0000000000114da5	retq
0000000000114da6	nopw	%cs:(%rax,%rax)
