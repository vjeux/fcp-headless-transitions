__ZN33HGArriLogCDefaultToneCurveLUTInfoC1EmffbN16HGApplyNDLUTInfo16LUTStorageFormatE:
0000000000113190	pushq	%rbp
0000000000113191	movq	%rsp, %rbp
0000000000113194	pushq	%r14
0000000000113196	pushq	%rbx
0000000000113197	movl	%edx, %ebx
0000000000113199	movq	%rdi, %r14
000000000011319c	movl	$0x1, %edx
00000000001131a1	callq	__ZN16HGApplyNDLUTInfoC2EmmffNS_16LUTStorageFormatE ## HGApplyNDLUTInfo::HGApplyNDLUTInfo(unsigned long, unsigned long, float, float, HGApplyNDLUTInfo::LUTStorageFormat)
00000000001131a6	leaq	0x90995b(%rip), %rax
00000000001131ad	movq	%rax, (%r14)
00000000001131b0	movb	%bl, 0x78(%r14)
00000000001131b4	movaps	0x2c17c5(%rip), %xmm0
00000000001131bb	movups	%xmm0, 0x28(%r14)
00000000001131c0	movaps	0x2c17c9(%rip), %xmm0
00000000001131c7	movups	%xmm0, 0x58(%r14)
00000000001131cc	movaps	0x2c17cd(%rip), %xmm0
00000000001131d3	movups	%xmm0, 0x38(%r14)
00000000001131d8	movaps	0x2c17d1(%rip), %xmm0
00000000001131df	movups	%xmm0, 0x68(%r14)
00000000001131e4	movaps	0x2c17d5(%rip), %xmm0
00000000001131eb	movups	%xmm0, 0x48(%r14)
00000000001131f0	popq	%rbx
00000000001131f1	popq	%r14
00000000001131f3	popq	%rbp
00000000001131f4	retq
00000000001131f5	nopw	%cs:(%rax,%rax)
