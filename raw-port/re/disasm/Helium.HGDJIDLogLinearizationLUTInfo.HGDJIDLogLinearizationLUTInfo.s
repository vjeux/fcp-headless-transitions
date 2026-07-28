__ZN29HGDJIDLogLinearizationLUTInfoC1EmffN16HGApplyNDLUTInfo16LUTStorageFormatE:
0000000000114be0	pushq	%rbp
0000000000114be1	movq	%rsp, %rbp
0000000000114be4	pushq	%rbx
0000000000114be5	pushq	%rax
0000000000114be6	movl	%edx, %ecx
0000000000114be8	movq	%rdi, %rbx
0000000000114beb	movl	$0x1, %edx
0000000000114bf0	callq	__ZN16HGApplyNDLUTInfoC2EmmffNS_16LUTStorageFormatE ## HGApplyNDLUTInfo::HGApplyNDLUTInfo(unsigned long, unsigned long, float, float, HGApplyNDLUTInfo::LUTStorageFormat)
0000000000114bf5	leaq	0x90836c(%rip), %rax
0000000000114bfc	movq	%rax, (%rbx)
0000000000114bff	addq	$0x8, %rsp
0000000000114c03	popq	%rbx
0000000000114c04	popq	%rbp
0000000000114c05	retq
0000000000114c06	nopw	%cs:(%rax,%rax)
