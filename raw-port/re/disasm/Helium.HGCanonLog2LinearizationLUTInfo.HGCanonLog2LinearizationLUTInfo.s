__ZN31HGCanonLog2LinearizationLUTInfoC1EmffN16HGApplyNDLUTInfo16LUTStorageFormatE:
0000000000113ca0	pushq	%rbp
0000000000113ca1	movq	%rsp, %rbp
0000000000113ca4	pushq	%rbx
0000000000113ca5	pushq	%rax
0000000000113ca6	movl	%edx, %ecx
0000000000113ca8	movq	%rdi, %rbx
0000000000113cab	movl	$0x1, %edx
0000000000113cb0	callq	__ZN16HGApplyNDLUTInfoC2EmmffNS_16LUTStorageFormatE ## HGApplyNDLUTInfo::HGApplyNDLUTInfo(unsigned long, unsigned long, float, float, HGApplyNDLUTInfo::LUTStorageFormat)
0000000000113cb5	leaq	0x908fdc(%rip), %rax
0000000000113cbc	movq	%rax, (%rbx)
0000000000113cbf	addq	$0x8, %rsp
0000000000113cc3	popq	%rbx
0000000000113cc4	popq	%rbp
0000000000113cc5	retq
0000000000113cc6	nopw	%cs:(%rax,%rax)
