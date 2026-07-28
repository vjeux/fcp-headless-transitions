__ZNK19FFPlaybackStateInfo18summaryDescriptionEv:
0000000000d72690	pushq	%rbp
0000000000d72691	movq	%rsp, %rbp
0000000000d72694	pushq	%r15
0000000000d72696	pushq	%r14
0000000000d72698	pushq	%r13
0000000000d7269a	pushq	%r12
0000000000d7269c	pushq	%rbx
0000000000d7269d	subq	$0x58, %rsp
0000000000d726a1	movq	%rdi, %r14
0000000000d726a4	callq	0x149791a                       ## symbol stub for: _objc_autoreleasePoolPush
0000000000d726a9	movq	%rax, %rbx
0000000000d726ac	cmpb	$0x0, 0x40(%r14)
0000000000d726b1	je	0xd72737
0000000000d726b7	movq	0x28(%r14), %rax
0000000000d726bb	movq	%rax, 0x28(%rsp)
0000000000d726c0	movups	0x18(%r14), %xmm0
0000000000d726c5	movups	%xmm0, 0x18(%rsp)
0000000000d726ca	movq	0x10(%r14), %rax
0000000000d726ce	movq	%rax, 0x10(%rsp)
0000000000d726d3	movups	(%r14), %xmm0
0000000000d726d7	movups	%xmm0, (%rsp)
0000000000d726db	callq	0x149511e                       ## symbol stub for: _CMTimeCompare
0000000000d726e0	movl	%eax, %r13d
0000000000d726e3	movq	0xb7ae7e(%rip), %rdi            ## literal pool symbol address: _OBJC_CLASS_$_NSString
0000000000d726ea	callq	0x14978fc                       ## symbol stub for: _objc_alloc
0000000000d726ef	movq	%rax, -0x30(%rbp)
0000000000d726f3	movq	0x10(%r14), %rax
0000000000d726f7	movq	%rax, 0x10(%rsp)
0000000000d726fc	movups	(%r14), %xmm0
0000000000d72700	movups	%xmm0, (%rsp)
0000000000d72704	callq	__ZL25PC_CMTimeToFractionString6CMTime ## PC_CMTimeToFractionString(CMTime)
0000000000d72709	movq	%rax, %r12
0000000000d7270c	movsd	0x30(%r14), %xmm0
0000000000d72712	movsd	0x38(%r14), %xmm1
0000000000d72718	movapd	0x7fa370(%rip), %xmm2
0000000000d72720	andpd	%xmm0, %xmm2
0000000000d72724	ucomisd	0x7fa93c(%rip), %xmm2
0000000000d7272c	ja	0xd72749
0000000000d7272e	leaq	0xc3af73(%rip), %r15            ## Objc cfstring ref: @"bad cfstring ref"
0000000000d72735	jmp	0xd72786
0000000000d72737	leaq	0xc3b02a(%rip), %rdi            ## Objc cfstring ref: @"bad cfstring ref"
0000000000d7273e	callq	*0xb7afcc(%rip)                 ## literal pool symbol address: _objc_retain
0000000000d72744	jmp	0xd727f4
0000000000d72749	movapd	0x7fa33f(%rip), %xmm3
0000000000d72751	andpd	%xmm1, %xmm3
0000000000d72755	movsd	0x7fa90b(%rip), %xmm2
0000000000d7275d	ucomisd	%xmm3, %xmm2
0000000000d72761	jbe	0xd7276c
0000000000d72763	leaq	0xc3af5e(%rip), %r15            ## Objc cfstring ref: @"bad cfstring ref"
0000000000d7276a	jmp	0xd72786
0000000000d7276c	ucomisd	0x7fa8f4(%rip), %xmm3
0000000000d72774	leaq	0xc3af6d(%rip), %rax            ## Objc cfstring ref: @"bad cfstring ref"
0000000000d7277b	leaq	0xc3af86(%rip), %r15            ## Objc cfstring ref: @"bad cfstring ref"
0000000000d72782	cmovaq	%rax, %r15
0000000000d72786	testl	%r13d, %r13d
0000000000d72789	leaq	0xbbd458(%rip), %rax            ## Objc cfstring ref: @"bad cfstring ref"
0000000000d72790	leaq	0xc3afb1(%rip), %r13            ## Objc cfstring ref: @"bad cfstring ref"
0000000000d72797	cmoveq	%rax, %r13
0000000000d7279b	je	0xd727cd
0000000000d7279d	addq	$0x18, %r14
0000000000d727a1	movq	0x10(%r14), %rax
0000000000d727a5	movq	%rax, 0x10(%rsp)
0000000000d727aa	movupd	(%r14), %xmm2
0000000000d727af	movupd	%xmm2, (%rsp)
0000000000d727b4	movapd	%xmm1, -0x50(%rbp)
0000000000d727b9	movapd	%xmm0, -0x40(%rbp)
0000000000d727be	callq	__ZL25PC_CMTimeToFractionString6CMTime ## PC_CMTimeToFractionString(CMTime)
0000000000d727c3	movapd	-0x40(%rbp), %xmm0
0000000000d727c8	movapd	-0x50(%rbp), %xmm1
0000000000d727cd	movq	0xe4a934(%rip), %rsi
0000000000d727d4	movq	%rax, (%rsp)
0000000000d727d8	leaq	0xc3af49(%rip), %rdx            ## Objc cfstring ref: @"bad cfstring ref"
0000000000d727df	movq	-0x30(%rbp), %rdi
0000000000d727e3	movq	%r12, %rcx
0000000000d727e6	movq	%r15, %r8
0000000000d727e9	movq	%r13, %r9
0000000000d727ec	movb	$0x2, %al
0000000000d727ee	callq	*0xb7aecc(%rip)                 ## Objc message: -[%rdi requestedSizeForAssetSize:scaleDownFactor:codec:outProxySizeAdjustedForCodec:]
0000000000d727f4	movq	%rax, %r14
0000000000d727f7	movq	%rbx, %rdi
0000000000d727fa	callq	0x1497914                       ## symbol stub for: _objc_autoreleasePoolPop
0000000000d727ff	movq	%r14, %rdi
0000000000d72802	addq	$0x58, %rsp
0000000000d72806	popq	%rbx
0000000000d72807	popq	%r12
0000000000d72809	popq	%r13
0000000000d7280b	popq	%r14
0000000000d7280d	popq	%r15
0000000000d7280f	popq	%rbp
0000000000d72810	jmp	0x149790e                       ## symbol stub for: _objc_autorelease
0000000000d72815	nopw	%cs:(%rax,%rax)
