+[FFOrganizerFrameDurationStringValueTransformer transformedValueClass]:
0000000000972770	pushq	%rbp
0000000000972771	movq	%rsp, %rbp
0000000000972774	movq	0xf7aded(%rip), %rdi            ## literal pool symbol address: _OBJC_CLASS_$_NSString
000000000097277b	popq	%rbp
000000000097277c	jmp	0x149798c                       ## symbol stub for: _objc_opt_class
0000000000972781	nopw	%cs:(%rax,%rax)
+[FFOrganizerFrameDurationStringValueTransformer allowsReverseTransformation]:
0000000000972790	pushq	%rbp
0000000000972791	movq	%rsp, %rbp
0000000000972794	xorl	%eax, %eax
0000000000972796	popq	%rbp
0000000000972797	retq
0000000000972798	nopl	(%rax,%rax)
-[FFOrganizerFrameDurationStringValueTransformer transformedValue:]:
00000000009727a0	pushq	%rbp
00000000009727a1	movq	%rsp, %rbp
00000000009727a4	pushq	%r14
00000000009727a6	pushq	%rbx
00000000009727a7	movq	%rdx, %rdi
00000000009727aa	movq	0x1246f07(%rip), %rsi
00000000009727b1	callq	*0xf7af09(%rip)                 ## Objc message: -[%rdi radAsset]
00000000009727b7	ucomisd	0xbfd781(%rip), %xmm0
00000000009727bf	jbe	0x9727c8
00000000009727c1	xorl	%ecx, %ecx
00000000009727c3	jmp	0x972867
00000000009727c8	movl	$0x1, %ecx
00000000009727cd	ucomisd	0xbfa36b(%rip), %xmm0
00000000009727d5	ja	0x972867
00000000009727db	movl	$0x2, %ecx
00000000009727e0	ucomisd	0xbffca0(%rip), %xmm0
00000000009727e8	ja	0x972867
00000000009727ea	movl	$0x3, %ecx
00000000009727ef	ucomisd	0xbfcf29(%rip), %xmm0
00000000009727f7	ja	0x972867
00000000009727f9	movl	$0x4, %ecx
00000000009727fe	ucomisd	0xbfc7ca(%rip), %xmm0
0000000000972806	ja	0x972867
0000000000972808	movl	$0x5, %ecx
000000000097280d	ucomisd	0xbfc7c3(%rip), %xmm0
0000000000972815	ja	0x972867
0000000000972817	movl	$0x6, %ecx
000000000097281c	ucomisd	0xbfa1d4(%rip), %xmm0
0000000000972824	ja	0x972867
0000000000972826	movl	$0x7, %ecx
000000000097282b	ucomisd	0xbfa21d(%rip), %xmm0
0000000000972833	ja	0x972867
0000000000972835	movl	$0x8, %ecx
000000000097283a	ucomisd	0xbfa2c6(%rip), %xmm0
0000000000972842	ja	0x972867
0000000000972844	movl	$0x9, %ecx
0000000000972849	ucomisd	0xbfa1af(%rip), %xmm0
0000000000972851	ja	0x972867
0000000000972853	movl	$0xa, %ecx
0000000000972858	ucomisd	0xbfa1d8(%rip), %xmm0
0000000000972860	ja	0x972867
0000000000972862	movl	$0xb, %ecx
0000000000972867	movq	0xf7acfa(%rip), %rdi            ## literal pool symbol address: _OBJC_CLASS_$_NSString
000000000097286e	movq	0x1245ca3(%rip), %rsi
0000000000972875	leaq	0x101d3ec(%rip), %rdx           ## Objc cfstring ref: @"bad cfstring ref"
000000000097287c	movq	0xf7ae3d(%rip), %r14            ## Objc message: -[%rdi radAsset]
0000000000972883	xorl	%eax, %eax
0000000000972885	callq	*%r14
0000000000972888	movq	%rax, %rbx
000000000097288b	callq	_FFFlexoBundle
0000000000972890	movq	0x1245c79(%rip), %rsi
0000000000972897	leaq	0xfbd34a(%rip), %rcx            ## Objc cfstring ref: @"bad cfstring ref"
000000000097289e	leaq	0xfbd363(%rip), %r8             ## Objc cfstring ref: @"bad cfstring ref"
00000000009728a5	movq	%rax, %rdi
00000000009728a8	movq	%rbx, %rdx
00000000009728ab	movq	%r14, %rax
00000000009728ae	popq	%rbx
00000000009728af	popq	%r14
00000000009728b1	popq	%rbp
00000000009728b2	jmpq	*%rax
00000000009728b4	nopw	%cs:(%rax,%rax)
_closestTickMarkIndexForDuration:
00000000009728c0	pushq	%rbp
00000000009728c1	movq	%rsp, %rbp
00000000009728c4	ucomisd	0xbfd674(%rip), %xmm0
00000000009728cc	jbe	0x9728d2
00000000009728ce	xorl	%eax, %eax
00000000009728d0	popq	%rbp
00000000009728d1	retq
00000000009728d2	movl	$0x1, %eax
00000000009728d7	ucomisd	0xbfa261(%rip), %xmm0
00000000009728df	ja	0x972971
00000000009728e5	movl	$0x2, %eax
00000000009728ea	ucomisd	0xbffb96(%rip), %xmm0
00000000009728f2	ja	0x972971
00000000009728f4	movl	$0x3, %eax
00000000009728f9	ucomisd	0xbfce1f(%rip), %xmm0
0000000000972901	ja	0x972971
0000000000972903	movl	$0x4, %eax
0000000000972908	ucomisd	0xbfc6c0(%rip), %xmm0
0000000000972910	ja	0x972971
0000000000972912	movl	$0x5, %eax
0000000000972917	ucomisd	0xbfc6b9(%rip), %xmm0
000000000097291f	ja	0x972971
0000000000972921	movl	$0x6, %eax
0000000000972926	ucomisd	0xbfa0ca(%rip), %xmm0
000000000097292e	ja	0x972971
0000000000972930	movl	$0x7, %eax
0000000000972935	ucomisd	0xbfa113(%rip), %xmm0
000000000097293d	ja	0x972971
000000000097293f	movl	$0x8, %eax
0000000000972944	ucomisd	0xbfa1bc(%rip), %xmm0
000000000097294c	ja	0x972971
000000000097294e	movl	$0x9, %eax
0000000000972953	ucomisd	0xbfa0a5(%rip), %xmm0
000000000097295b	ja	0x972971
000000000097295d	movl	$0xa, %eax
0000000000972962	ucomisd	0xbfa0ce(%rip), %xmm0
000000000097296a	ja	0x972971
000000000097296c	movl	$0xb, %eax
0000000000972971	popq	%rbp
0000000000972972	retq
0000000000972973	nopw	%cs:(%rax,%rax)
+[FFOrganizerFrameDurationTickMarkValueTransformer transformedValueClass]:
0000000000972980	pushq	%rbp
0000000000972981	movq	%rsp, %rbp
0000000000972984	movq	0xf7ab5d(%rip), %rdi            ## literal pool symbol address: _OBJC_CLASS_$_NSNumber
