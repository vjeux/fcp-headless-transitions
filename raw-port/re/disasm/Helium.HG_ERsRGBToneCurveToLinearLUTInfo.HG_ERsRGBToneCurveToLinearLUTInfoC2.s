__ZN33HG_ERsRGBToneCurveToLinearLUTInfoC2EmffN16HGApplyNDLUTInfo16LUTStorageFormatE:
0000000000115300	pushq	%rbp
0000000000115301	movq	%rsp, %rbp
0000000000115304	pushq	%rbx
0000000000115305	pushq	%rax
0000000000115306	movl	%edx, %ecx
0000000000115308	movq	%rdi, %rbx
000000000011530b	movl	$0x1, %edx
0000000000115310	callq	__ZN16HGApplyNDLUTInfoC2EmmffNS_16LUTStorageFormatE ## HGApplyNDLUTInfo::HGApplyNDLUTInfo(unsigned long, unsigned long, float, float, HGApplyNDLUTInfo::LUTStorageFormat)
0000000000115315	leaq	0x907ddc(%rip), %rax
000000000011531c	movq	%rax, (%rbx)
000000000011531f	addq	$0x8, %rsp
0000000000115323	popq	%rbx
0000000000115324	popq	%rbp
0000000000115325	retq
0000000000115326	nopw	%cs:(%rax,%rax)
