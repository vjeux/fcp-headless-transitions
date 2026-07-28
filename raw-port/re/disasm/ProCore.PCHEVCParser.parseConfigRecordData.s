__ZN12PCHEVCParser21parseConfigRecordDataEPK25opaqueCMFormatDescriptionPb:
0000000000001660	pushq	%rbp
0000000000001661	movq	%rsp, %rbp
0000000000001664	pushq	%r15
0000000000001666	pushq	%r14
0000000000001668	pushq	%r13
000000000000166a	pushq	%r12
000000000000166c	pushq	%rbx
000000000000166d	subq	$0x68, %rsp
0000000000001671	movq	%rdx, %r13
0000000000001674	movq	%rsi, %rax
0000000000001677	movq	%rdi, %r14
000000000000167a	movq	0x146137(%rip), %rcx            ## literal pool symbol address: _kCMFormatDescriptionExtension_SampleDescriptionExtensionAtoms
0000000000001681	movq	(%rcx), %rsi
0000000000001684	movq	%rax, %rdi
0000000000001687	callq	0xde366                         ## symbol stub for: _CMFormatDescriptionGetExtension
000000000000168c	testq	%rax, %rax
000000000000168f	je	0x191f
0000000000001695	movq	%rax, %rbx
0000000000001698	callq	0xddfac                         ## symbol stub for: _CFDictionaryGetTypeID
000000000000169d	movq	%rax, %r15
00000000000016a0	movq	%rbx, %rdi
00000000000016a3	callq	0xddfd0                         ## symbol stub for: _CFGetTypeID
00000000000016a8	cmpq	%rax, %r15
00000000000016ab	jne	0x191f
00000000000016b1	leaq	0x14b5e0(%rip), %rsi            ## Objc cfstring ref: @"bad cfstring ref"
00000000000016b8	movq	%rbx, %rdi
00000000000016bb	callq	0xddfb2                         ## symbol stub for: _CFDictionaryGetValue
00000000000016c0	testq	%rax, %rax
00000000000016c3	je	0x191f
00000000000016c9	movq	%rax, %r15
00000000000016cc	movq	%rax, %rdi
00000000000016cf	callq	0xddfd0                         ## symbol stub for: _CFGetTypeID
00000000000016d4	movq	%rax, %rbx
00000000000016d7	callq	0xddef8                         ## symbol stub for: _CFArrayGetTypeID
00000000000016dc	cmpq	%rax, %rbx
00000000000016df	je	0x16fa
00000000000016e1	movq	%r15, %rdi
00000000000016e4	callq	0xddfd0                         ## symbol stub for: _CFGetTypeID
00000000000016e9	movq	%rax, %rbx
00000000000016ec	callq	0xddf6a                         ## symbol stub for: _CFDataGetTypeID
00000000000016f1	cmpq	%rax, %rbx
00000000000016f4	jne	0x191f
00000000000016fa	movq	%r15, %rdi
00000000000016fd	callq	0xddfd0                         ## symbol stub for: _CFGetTypeID
0000000000001702	movq	%rax, %rbx
0000000000001705	callq	0xddef8                         ## symbol stub for: _CFArrayGetTypeID
000000000000170a	cmpq	%rax, %rbx
000000000000170d	jne	0x171c
000000000000170f	movq	%r15, %rdi
0000000000001712	xorl	%esi, %esi
0000000000001714	callq	0xddefe                         ## symbol stub for: _CFArrayGetValueAtIndex
0000000000001719	movq	%rax, %r15
000000000000171c	movq	%r15, %rdi
000000000000171f	callq	0xddfd0                         ## symbol stub for: _CFGetTypeID
0000000000001724	movq	%rax, %rbx
0000000000001727	callq	0xddf6a                         ## symbol stub for: _CFDataGetTypeID
000000000000172c	cmpq	%rax, %rbx
000000000000172f	jne	0x191f
0000000000001735	movq	%r15, %rdi
0000000000001738	callq	0xddf52                         ## symbol stub for: _CFDataGetBytePtr
000000000000173d	movq	%rax, %r12
0000000000001740	movq	%r15, %rdi
0000000000001743	callq	0xddf5e                         ## symbol stub for: _CFDataGetLength
0000000000001748	movq	%rax, %r15
000000000000174b	testq	%r12, %r12
000000000000174e	setne	%al
0000000000001751	cmpl	$0x17, %r15d
0000000000001755	setge	%cl
0000000000001758	andb	%al, %cl
000000000000175a	cmpb	$0x1, %cl
000000000000175d	jne	0x191f
0000000000001763	movzbl	0x10(%r12), %eax
0000000000001769	andl	$0x3, %eax
000000000000176c	movl	%eax, (%r14)
000000000000176f	movzbl	0x11(%r12), %eax
0000000000001775	andl	$0x7, %eax
0000000000001778	orl	$0x8, %eax
000000000000177b	movl	%eax, 0x4(%r14)
000000000000177f	movzbl	0x12(%r12), %eax
0000000000001785	andl	$0x7, %eax
0000000000001788	orl	$0x8, %eax
000000000000178b	movl	%eax, 0x8(%r14)
000000000000178f	movb	$0x1, %al
0000000000001791	testq	%r13, %r13
0000000000001794	je	0x1921
000000000000179a	movq	%r13, -0x48(%rbp)
000000000000179e	movzbl	0x16(%r12), %eax
00000000000017a4	movl	%eax, -0x34(%rbp)
00000000000017a7	testl	%eax, %eax
00000000000017a9	sete	%al
00000000000017ac	cmpl	$0x22, %r15d
00000000000017b0	setb	%cl
00000000000017b3	movl	$0x0, -0x30(%rbp)
00000000000017ba	orb	%al, %cl
00000000000017bc	movl	$0x0, %ebx
00000000000017c1	jne	0x1915
00000000000017c7	addl	$-0x17, %r15d
00000000000017cb	addq	$0x17, %r12
00000000000017cf	leaq	-0x90(%rbp), %r13
00000000000017d6	movzwl	0x1(%r12), %ecx
00000000000017dc	rolw	$0x8, %cx
00000000000017e0	leaq	0x3(%r12), %rax
00000000000017e5	addl	$-0x3, %r15d
00000000000017e9	xorl	%edx, %edx
00000000000017eb	testw	%cx, %cx
00000000000017ee	je	0x18f5
00000000000017f4	movzwl	%cx, %esi
00000000000017f7	movb	(%r12), %dil
00000000000017fb	andb	$0x3f, %dil
00000000000017ff	movq	%rax, %r12
0000000000001802	movl	%esi, -0x38(%rbp)
0000000000001805	movb	%dil, -0x2b(%rbp)
0000000000001809	movzwl	(%r12), %ecx
000000000000180e	xorl	%ebx, %ebx
0000000000001810	cmpb	$0x27, %dil
0000000000001814	jne	0x18c4
000000000000181a	movw	%cx, -0x2a(%rbp)
000000000000181e	movl	%edx, -0x3c(%rbp)
0000000000001821	leaq	0x4(%r12), %rsi
0000000000001826	leal	-0x4(%r15), %edx
000000000000182a	movq	%r13, %rdi
000000000000182d	callq	__ZN11PCVLCParserC1EPKhi        ## PCVLCParser::PCVLCParser(unsigned char const*, int)
0000000000001832	movq	%r13, %rdi
0000000000001835	movl	$0x8, %esi
000000000000183a	callq	__ZN11PCVLCParser1uEi           ## PCVLCParser::u(int)
000000000000183f	addl	%eax, %ebx
0000000000001841	cmpl	$0xff, %eax
0000000000001846	je	0x1832
0000000000001848	cmpl	$0xb0, %ebx
000000000000184e	je	0x1898
0000000000001850	xorl	%eax, %eax
0000000000001852	movl	%eax, %r14d
0000000000001855	movq	%r13, %rdi
0000000000001858	movl	$0x8, %esi
000000000000185d	callq	__ZN11PCVLCParser1uEi           ## PCVLCParser::u(int)
0000000000001862	movl	%eax, %ebx
0000000000001864	leal	(%rbx,%r14), %eax
0000000000001868	cmpl	$0xff, %ebx
000000000000186e	je	0x1852
0000000000001870	testl	%eax, %eax
0000000000001872	jle	0x1888
0000000000001874	addl	%r14d, %ebx
0000000000001877	movq	%r13, %rdi
000000000000187a	movl	$0x8, %esi
000000000000187f	callq	__ZN11PCVLCParser1uEi           ## PCVLCParser::u(int)
0000000000001884	decl	%ebx
0000000000001886	jne	0x1877
0000000000001888	movq	%r13, %rdi
000000000000188b	callq	__ZNK11PCVLCParser15hasMoreRBSPDataEv ## PCVLCParser::hasMoreRBSPData() const
0000000000001890	xorl	%ebx, %ebx
0000000000001892	testb	%al, %al
0000000000001894	jne	0x1832
0000000000001896	jmp	0x189a
0000000000001898	movb	$0x1, %bl
000000000000189a	movzwl	-0x2a(%rbp), %ecx
000000000000189e	movq	-0x90(%rbp), %rdi
00000000000018a5	testq	%rdi, %rdi
00000000000018a8	je	0x18ba
00000000000018aa	movq	%rdi, -0x88(%rbp)
00000000000018b1	callq	0xde6c0                         ## symbol stub for: __ZdlPv
00000000000018b6	movzwl	-0x2a(%rbp), %ecx
00000000000018ba	movl	-0x3c(%rbp), %edx
00000000000018bd	movl	-0x38(%rbp), %esi
00000000000018c0	movb	-0x2b(%rbp), %dil
00000000000018c4	rolw	$0x8, %cx
00000000000018c8	movq	%r12, %rax
00000000000018cb	addq	$0x2, %rax
00000000000018cf	addl	$-0x2, %r15d
00000000000018d3	movzwl	%cx, %ecx
00000000000018d6	movl	%ecx, %r12d
00000000000018d9	addq	%rax, %r12
00000000000018dc	subl	%ecx, %r15d
00000000000018df	incl	%edx
00000000000018e1	cmpl	%esi, %edx
00000000000018e3	jae	0x18fa
00000000000018e5	testb	%bl, %bl
00000000000018e7	jne	0x18fa
00000000000018e9	cmpl	$0x7, %r15d
00000000000018ed	jg	0x1809
00000000000018f3	jmp	0x18fa
00000000000018f5	xorl	%ebx, %ebx
00000000000018f7	movq	%rax, %r12
00000000000018fa	movl	-0x30(%rbp), %eax
00000000000018fd	incl	%eax
00000000000018ff	movl	%eax, -0x30(%rbp)
0000000000001902	cmpl	-0x34(%rbp), %eax
0000000000001905	jae	0x1915
0000000000001907	testb	%bl, %bl
0000000000001909	jne	0x1915
000000000000190b	cmpl	$0xa, %r15d
000000000000190f	jg	0x17d6
0000000000001915	movq	-0x48(%rbp), %rax
0000000000001919	movb	%bl, (%rax)
000000000000191b	movb	$0x1, %al
000000000000191d	jmp	0x1921
000000000000191f	xorl	%eax, %eax
0000000000001921	addq	$0x68, %rsp
0000000000001925	popq	%rbx
0000000000001926	popq	%r12
0000000000001928	popq	%r13
000000000000192a	popq	%r14
000000000000192c	popq	%r15
000000000000192e	popq	%rbp
000000000000192f	retq
0000000000001930	jmp	0x1936
0000000000001932	jmp	0x1936
0000000000001934	jmp	0x1936
0000000000001936	movq	%rax, %rbx
0000000000001939	movq	-0x90(%rbp), %rdi
0000000000001940	testq	%rdi, %rdi
0000000000001943	je	0x1951
0000000000001945	movq	%rdi, -0x88(%rbp)
000000000000194c	callq	0xde6c0                         ## symbol stub for: __ZdlPv
0000000000001951	movq	%rbx, %rdi
0000000000001954	callq	0xde50a                         ## symbol stub for: __Unwind_Resume
